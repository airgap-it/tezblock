import { Location } from '@angular/common'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AirGapMarketWallet, BakerInfo, DelegationInfo, DelegationRewardInfo, TezosKtProtocol } from 'airgap-coin-lib'
import BigNumber from 'big-number'
// import BigNumber from 'bignumber.js'
import * as moment from 'moment'
import { MyTezosBakerResponse } from 'src/app/interfaces/MyTezosBakerResponse'
import { TezosBakerResponse } from 'src/app/interfaces/TezosBakerResponse'

import { ApiErrorObject } from '../../interfaces/ApiErrorObject'
import { BakingBadResponse } from '../../interfaces/BakingBadResponse'
// import { BakerConfig } from '../remote-config/remote-config.service'
import { OperationsService } from '../operations/operations.service'
import { Observable } from 'rxjs'

type Moment = moment.Moment
const hoursPerCycle = 68

@Injectable({
  providedIn: 'root'
})
export class BakingService {
  public bakerInfo?: BakerInfo

  private readonly newBakingBadUrl = 'https://test.baking-bad.org/v1/bakers'
  private readonly bakingBadUrl = 'https://api.baking-bad.org/v1/ratings'
  private readonly tezosBakerUrl = 'https://api.mytezosbaker.com/v1/bakers/'

  public bakerConfigError: string | undefined

  public wallet: AirGapMarketWallet

  public delegationRewards: DelegationRewardInfo[]

  public avgRoIPerCyclePercentage: BigNumber
  public avgRoIPerCycle: BigNumber

  public isDelegated: boolean
  public nextPayout: Date

  public delegationInfo: DelegationInfo
  // public bakerConfig: BakerConfig

  constructor(
    private readonly http: HttpClient,
    public location: Location,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public operationsService: OperationsService
  ) {}

  public async getBakingBadRatings(address: string): Promise<ApiErrorObject> {
    return new Promise(resolve => {
      this.http.get<BakingBadResponse>(`${this.bakingBadUrl}/${address}`).subscribe(
        (response: BakingBadResponse) => {
          console.log('response: ', response)
          resolve({ status: 'success', rating: response.status })
        },
        err => {
          resolve({ status: 'error' })
        }
      )
    })
  }

  public getBakingBadRatings2(address: string): Promise<ApiErrorObject> {
    return new Promise(resolve => {
      this.http.get(`${this.newBakingBadUrl}/${address}`, { params: { ['rating']: 'true' } }).subscribe(
        response => {
          console.log('antwort: ', response)
          resolve({ status: 'success' })
        },
        err => {
          resolve({ status: 'error' })
        }
      )
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
    const protocol = new TezosKtProtocol()

    return protocol.isAddressDelegated(address)
  }

  public async getBakerInfos(tzAddress: string) {
    const info: string = this.router.url.split('/').pop()
    // this.delegationInfo = await this.operationsService.checkDelegated(info)
    // this.isDelegated = this.delegationInfo.isDelegated

    const kt = new TezosKtProtocol()

    this.bakerInfo = await kt.bakerInfo(tzAddress)
    /*
    try {
      this.delegationRewards = await kt.delegationRewards(tzAddress)
      this.avgRoIPerCyclePercentage = this.delegationRewards
        .map(delegationInfo => {
          return delegationInfo.totalRewards.plus(delegationInfo.totalFees).div(delegationInfo.stakingBalance)
        })
        .reduce((avg, value) => {
          return avg.plus(value)
        })
        .div(this.delegationRewards.length)

      this.avgRoIPerCycle = this.avgRoIPerCyclePercentage.multipliedBy(this.bakerInfo.stakingBalance.toNumber())
      // we are already delegating, and to this address
      if (this.delegationInfo.isDelegated && this.delegationInfo.value === tzAddress) {
        const delegatedCycles = this.delegationRewards.filter(value => value.delegatedBalance.isGreaterThan(0))

        this.nextPayout = delegatedCycles.length > 0 ? delegatedCycles[0].payout : this.addPayoutDelayToMoment(moment()).toDate()

        // make sure there are at least 7 cycles to wait
        if (this.addPayoutDelayToMoment(moment(this.delegationInfo.delegatedDate)).isAfter(this.nextPayout)) {
          this.nextPayout = this.addPayoutDelayToMoment(moment(this.delegationInfo.delegatedDate)).toDate()
        }
      } else {
        // if we are currently delegated, but to someone else, first payout is in 7 cycles, same for if we are undelegated
        this.nextPayout = this.addPayoutDelayToMoment(moment()).toDate()
      }
    } catch (error) {
      // If Baker has never delegated
		}
		*/
    const bal1 = this.bakerInfo.stakingBalance.toNumber()
    const cap2 = this.bakerInfo.bakerCapacity.multipliedBy(0.7).toNumber()
    // End remove

    const stakingBalance = bal1
    const stakingCapacity = cap2

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
