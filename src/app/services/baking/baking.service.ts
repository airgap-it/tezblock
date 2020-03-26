import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AirGapMarketWallet, BakerInfo, DelegationInfo, DelegationRewardInfo, TezosKtProtocol, TezosProtocol } from 'airgap-coin-lib'
import BigNumber from 'big-number'
import * as moment from 'moment'
import { Observable, of } from 'rxjs'
import { map, switchMap, tap } from 'rxjs/operators'

import { BakingBadResponse } from 'src/app/interfaces/BakingBadResponse'
import { MyTezosBakerResponse } from 'src/app/interfaces/MyTezosBakerResponse'
import { TezosBakerResponse, Baker } from 'src/app/interfaces/TezosBakerResponse'
import { ChainNetworkService } from '../chain-network/chain-network.service'
import { get } from '@tezblock/services/fp'
import { get as _get } from 'lodash'
import { ByCycleState, CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'

interface TezosNodesApiResponse {
  name: string
  address: string
  efficiency_last10cycle: number
  freespace: number
  last_endoresment: string
  last_baking: string
  next_endoresment: string
  next_baking: string
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

  private readonly bakingBadUrl = 'https://api.baking-bad.org/v2/bakers'
  private readonly tezosBakerUrl = 'https://api.mytezosbaker.com/v1/bakers/'
  private readonly efficiencyLast10CyclesUrl = 'https://api.tezos-nodes.com/v1/baker/'
  private readonly airgapCorsProxy = 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url='

  constructor(
    private readonly cacheService: CacheService,
    private readonly http: HttpClient,
    readonly chainNetworkService: ChainNetworkService
  ) {}

  environmentUrls = this.chainNetworkService.getEnvironment()

  getBakingBadRatings(address: string): Observable<BakingBadResponse> {
    return this.http
      .get<BakingBadResponse>(`${this.bakingBadUrl}/${address}`, {
        params: { configs: 'true', insurance: 'true' }
      })
      .pipe(
        map(response => ({
          ...response,
          status: response ? 'success' : 'error'
        }))
      )
  }

  getTezosBakerInfos(address: string): Promise<MyTezosBakerResponse> {
    return new Promise(resolve => {
      this.cacheService
        .get(CacheKeys.fromCurrentCycle)
        .pipe(
          switchMap(currentCycleCache => {
            const myTezosBaker = _get(currentCycleCache, 'myTezosBaker')

            if (myTezosBaker) {
              return of(myTezosBaker)
            }

            return this.http.get<TezosBakerResponse>(this.tezosBakerUrl).pipe(
              tap(myTezosBaker =>
                this.cacheService.update<ByCycleState>(CacheKeys.fromCurrentCycle, currentCycleCache => ({
                  ...currentCycleCache,
                  myTezosBaker
                }))
              )
            )
          })
        )
        .subscribe(
          (response: TezosBakerResponse) => {
            const match: Baker = response.bakers.find(baker => baker.delegation_code === address)

            if (match) {
              resolve({
                status: 'success',
                rating: match.baker_efficiency,
                fee: match.fee,
                myTB: match.voting,
                baker_name: match.baker_name,
                delegation_code: match.delegation_code
              })

              return
            }

            resolve({ status: 'error' })
          },
          (/* error */) => resolve({ status: 'error' })
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
    return this.http
      .get<TezosNodesApiResponse>(`${this.airgapCorsProxy}${this.efficiencyLast10CyclesUrl}${address}`)
      .pipe(map(response => response.efficiency_last10cycle))
  }
}
