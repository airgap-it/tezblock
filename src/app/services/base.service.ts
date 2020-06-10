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
  function: 'count' | 'sum' | 'max'
}

export type Direction = 'asc' | 'desc'

export interface OrderBy {
  field: string
  direction: Direction
}

export interface Body {
  fields?: string[]
  predicates?: Predicate[]
  orderBy?: OrderBy[]
  aggregation?: Aggregation[]
  limit?: number
}

export const getNextOrderBy = (orderBy?: OrderBy, field?: string): OrderBy => {
  if (!orderBy || orderBy.field !== field) {
    return { field, direction: 'desc' }
  }

  if (orderBy.direction === 'desc') {
    return { ...orderBy, direction: 'asc' }
  }

  return undefined
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

  constructor(protected readonly chainNetworkService: ChainNetworkService, protected readonly httpClient: HttpClient) {
    this.environmentUrls = chainNetworkService.getEnvironment()
    this.environmentVariable = chainNetworkService.getEnvironmentVariable()
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        apikey: this.environmentUrls.conseilApiKey
      })
    }
  }

  post<T>(url: string, body: Body, isFullUrl = false): Observable<T> {
    const _url = this.getUrl(url, isFullUrl)

    return this.httpClient.post<T>(_url, body, this.options)
  }

  get<T>(url: string, isFullUrl = false, useOptions = false): Observable<T> {
    const _url: string = this.getUrl(url, isFullUrl)
    const options: Options = useOptions ? this.options : undefined

    return this.httpClient.get<T>(_url, options)
  }

  protected getUrl(url: string, isFullUrl = false): string {
    return isFullUrl
    ? url
        .replace(ENVIRONMENT_URL.rpcUrl, this.environmentUrls.rpcUrl)
        .replace(ENVIRONMENT_URL.conseilUrl, this.environmentUrls.conseilUrl)
        .replace(ENVIRONMENT_URL.targetUrl, this.environmentUrls.targetUrl)
        .replace(ENVIRONMENT_VAR, this.environmentVariable)
    : `${this.environmentUrls.conseilUrl}/v2/data/tezos/${this.environmentVariable}/${url}`
  }
}
