import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AirGapMarketWallet, BakerInfo, DelegationInfo, DelegationRewardInfo, TezosKtProtocol, TezosProtocol } from 'airgap-coin-lib'
import BigNumber from 'big-number'
import * as moment from 'moment'
import { BakingBadResponse } from 'src/app/interfaces/BakingBadResponse'
import { MyTezosBakerResponse } from 'src/app/interfaces/MyTezosBakerResponse'
import { TezosBakerResponse } from 'src/app/interfaces/TezosBakerResponse'

import { ApiErrorObject } from '../../interfaces/ApiErrorObject'
import { OperationsService } from '../operations/operations.service'
import { ChainNetworkService } from '../chain-network/chain-network.service'

type Moment = moment.Moment
const hoursPerCycle = 68

@Injectable({
  providedIn: 'root'
})
export class BakingService {
  public bakerInfo?: BakerInfo

  private readonly bakingBadUrl = 'https://api.baking-bad.org/v1/bakers'
  private readonly tezosBakerUrl = 'https://api.mytezosbaker.com/v1/bakers/'

  public bakerConfigError: string | undefined

  public wallet: AirGapMarketWallet

  public delegationRewards: DelegationRewardInfo[]

  public avgRoIPerCyclePercentage: BigNumber
  public avgRoIPerCycle: BigNumber

  public isDelegated: boolean
  public nextPayout: Date

  public delegationInfo: DelegationInfo

  constructor(
    private readonly http: HttpClient,
    public location: Location,
    private readonly router: Router,
    public operationsService: OperationsService,
    public readonly chainNetworkService: ChainNetworkService
  ) {}

  public environmentUrls = this.chainNetworkService.getEnvironment()

  public getBakingBadRatings(address: string): Promise<ApiErrorObject> {
    return new Promise(resolve => {
      this.http
        .get<BakingBadResponse>(`${this.bakingBadUrl}/${address}`, {
          params: { ['rating']: 'true', ['configs']: 'true', ['insurance']: 'true' }
        })
        .subscribe((response: BakingBadResponse) => {
          if (response !== null) {
            resolve({ status: 'success', rating: response.rating.status })
          } else {
            resolve({ status: 'error' })
          }
        })
    })
  }

  public async getTezosBakerInfos(address: string): Promise<MyTezosBakerResponse> {
    return new Promise(resolve => {
      this.http.get<TezosBakerResponse>(this.tezosBakerUrl).subscribe(
        (response: TezosBakerResponse) => {
          response.bakers.forEach(baker => {
            if (baker.delegation_code === address) {
              resolve({
                status: 'success',
                rating: baker.baker_efficiency,
                fee: baker.fee,
                myTB: baker.voting,
                baker_name: baker.baker_name,
                delegation_code: baker.delegation_code
              })
            }
          })
          resolve({ status: 'error' })
        },
        err => {
          resolve({ status: 'error' })
        }
      )
    })
  }

  public async checkDelegated(address: string): Promise<DelegationInfo> {
    const protocol = new TezosKtProtocol(this.environmentUrls.rpc, this.environmentUrls.conseil)

    return protocol.isAddressDelegated(address)
  }

  public async getBakerInfos(tzAddress: string) {
    const tezosProtocol = new TezosProtocol(this.environmentUrls.rpc, this.environmentUrls.conseil)

    this.bakerInfo = await tezosProtocol.bakerInfo(tzAddress)

    const stakingBalance = this.bakerInfo.stakingBalance.toNumber()
    const stakingCapacity = this.bakerInfo.bakerCapacity.multipliedBy(0.7).toNumber()

    let stakingProgress = 1 - (stakingCapacity - stakingBalance) / stakingCapacity
    stakingProgress = stakingProgress * 100

    const nextPayout = this.nextPayout
    const avgRoI = this.avgRoIPerCycle

    return {
      stakingBalance,
      stakingCapacity,
      stakingProgress,
      nextPayout,
      avgRoI,
      selfBond: this.bakerInfo.selfBond
    }
  }

  public addPayoutDelayToMoment(time: Moment): Moment {
    return time.add(hoursPerCycle * 7 + 0, 'h')
  }
}
