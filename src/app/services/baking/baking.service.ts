import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AirGapMarketWallet, BakerInfo, DelegationInfo, DelegationRewardInfo, TezosKtProtocol, TezosProtocol } from 'airgap-coin-lib'
import BigNumber from 'big-number'
import * as moment from 'moment'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { BakingBadResponse } from 'src/app/interfaces/BakingBadResponse'
import { MyTezosBakerResponse } from 'src/app/interfaces/MyTezosBakerResponse'
import { TezosBakerResponse } from 'src/app/interfaces/TezosBakerResponse'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { get } from '@tezblock/services/fp'

interface Efficiency {
  [address: string]: number
}

type Moment = moment.Moment
const hoursPerCycle = 68

@Injectable({
  providedIn: 'root'
})
export class BakingService {
  bakerInfo?: BakerInfo

  bakerConfigError: string | undefined

  wallet: AirGapMarketWallet

  delegationRewards: DelegationRewardInfo[]

  avgRoIPerCyclePercentage: BigNumber
  avgRoIPerCycle: BigNumber

  isDelegated: boolean
  nextPayout: Date

  delegationInfo: DelegationInfo

  private readonly bakingBadUrl = 'https://api.baking-bad.org/v1/bakers'
  private readonly tezosBakerUrl = 'https://api.mytezosbaker.com/v1/bakers/'
  private readonly efficiencyLast10CyclesUrl = 'https://tezos-nodes.com/api/last10/'

  constructor(
    private readonly http: HttpClient,
    readonly chainNetworkService: ChainNetworkService
  ) {}

  environmentUrls = this.chainNetworkService.getEnvironment()

  getBakingBadRatings(address: string): Observable<BakingBadResponse> {
    return this.http
      .get<BakingBadResponse>(`${this.bakingBadUrl}/${address}`, {
        params: { rating: 'true', configs: 'true', insurance: 'true' }
      })
      .pipe(
        map(response => ({
          ...response,
          status: response ? 'success' : 'error'
        }))
      )
  }

  async getTezosBakerInfos(address: string): Promise<MyTezosBakerResponse> {
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

  async checkDelegated(address: string): Promise<DelegationInfo> {
    const network = this.chainNetworkService.getNetwork()
    const protocol = new TezosKtProtocol(
      this.environmentUrls.rpcUrl,
      this.environmentUrls.conseilUrl,
      network,
      this.chainNetworkService.getEnvironmentVariable(),
      this.environmentUrls.conseilApiKey
    )

    return protocol.isAddressDelegated(address)
  }

  async getBakerInfos(tzAddress: string) {
    const network = this.chainNetworkService.getNetwork()
    const tezosProtocol = new TezosProtocol(
      this.environmentUrls.rpcUrl,
      this.environmentUrls.conseilUrl,
      network,
      this.chainNetworkService.getEnvironmentVariable(),
      this.environmentUrls.conseilApiKey
    )

    this.bakerInfo = await tezosProtocol.bakerInfo(tzAddress)

    const stakingBond = this.bakerInfo.balance.toNumber()
    const stakingBalance = this.bakerInfo.stakingBalance.toNumber()
    const stakingCapacity = this.bakerInfo.bakerCapacity.multipliedBy(0.7).toNumber()

    let stakingProgress = 1 - (stakingCapacity - stakingBalance) / stakingCapacity
    stakingProgress = stakingProgress * 100

    const nextPayout = this.nextPayout
    const avgRoI = this.avgRoIPerCycle

    return {
      stakingBalance,
      stakingCapacity,
      stakingBond,
      stakingProgress,
      nextPayout,
      avgRoI,
      selfBond: this.bakerInfo.selfBond
    }
  }

  addPayoutDelayToMoment(time: Moment): Moment {
    return time.add(hoursPerCycle * 7 + 0, 'h')
  }

  getEfficiencyLast10Cycles(address: string): Observable<number> {
    return this.http.get<Efficiency>(`${this.efficiencyLast10CyclesUrl}${address}`).pipe(map(get(efficiency => efficiency[address])))
  }
}
