import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

import { ChainNetworkService } from './chain-network/chain-network.service'
import { Observable } from 'rxjs'

export interface Predicate {
  field: string
  operation: string
  set?: any[]
  inverse?: boolean
}

export interface Body {
  fields?: string[]
  predicates: Predicate[]
  orderBy?: { field: string; direction: string }[]
  limit?: number
}

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
