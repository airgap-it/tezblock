import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { ChainNetworkService } from './chain-network/chain-network.service'
import { Observable } from 'rxjs'

export const maxLimit = 100000

export enum Operation {
  after = 'after',
  between = 'between',
  eq = 'eq',
  in = 'in',
  lt = 'lt',
  gt = 'gt',
  isnull = 'isnull',
  startsWith = 'startsWith',
  like = 'like'
}

export interface Predicate {
  field: string
  operation?: Operation
  set?: any[]
  inverse?: boolean
  group?: string
}

export interface Aggregation {
  field: string
  function: 'count' | 'sum'
}
export interface OrderBy {
  field: string
  direction: 'asc' | 'desc'
}
export interface Body {
  fields?: string[]
  predicates?: Predicate[]
  orderBy?: OrderBy[]
  aggregation?: Aggregation[]
  limit?: number
}

export const andGroup = (predicates: Predicate[], groupSymbol: string, operation: Operation = Operation.eq): Predicate[] =>
  predicates.map(predicate => ({
    ...predicate,
    operation: predicate.operation || operation,
    group: groupSymbol
  }))

export enum ENVIRONMENT_URL {
  rpcUrl = '{rpcUrl}',
  conseilUrl = '{conseilUrl}',
  targetUrl = '{targetUrl}'
}

export const ENVIRONMENT_VAR = '{environmentVariable}'

export interface EnvironmentUrls {
  rpcUrl: string
  conseilUrl: string
  conseilApiKey: string
  targetUrl: string
}

export interface Options {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[]
      }
  observe?: 'body'
  params?:
    | HttpParams
    | {
        [param: string]: string | string[]
      }
  reportProgress?: boolean
  responseType?: 'json'
  withCredentials?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected readonly environmentUrls: EnvironmentUrls
  protected readonly environmentVariable: string
  protected readonly options: Options

  constructor(private readonly chainNetworkService: ChainNetworkService, private readonly httpClient: HttpClient) {
    this.environmentUrls = this.chainNetworkService.getEnvironment()
    this.environmentVariable = this.chainNetworkService.getEnvironmentVariable()
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        apikey: this.environmentUrls.conseilApiKey
      })
    }
  }

  public post<T>(url: string, body: Body, isFullUrl = false): Observable<T> {
    const _url = isFullUrl
      ? url
          .replace(ENVIRONMENT_URL.rpcUrl, this.environmentUrls.rpcUrl)
          .replace(ENVIRONMENT_URL.conseilUrl, this.environmentUrls.conseilUrl)
          .replace(ENVIRONMENT_URL.targetUrl, this.environmentUrls.targetUrl)
          .replace(ENVIRONMENT_VAR, this.environmentVariable)
      : `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/${url}`

    return this.httpClient.post<T>(_url, body, this.options)
  }
}
