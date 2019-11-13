import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'

import { BlockService } from '../../services/blocks/blocks.service'
import { TransactionService } from '../../services/transaction /transaction.service'

import { Tab } from './../../components/tabbed-table/tabbed-table.component'
import { ApiService } from './../../services/api/api.service'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  public tabs: Tab[]
  public page: string
  public loading$: Observable<boolean>
  public type: string
  private dataService
  public data$: Observable<Object>
  public componentView: string | undefined
  public transactionsLoading$: Observable<boolean>

  constructor(private readonly apiService: ApiService, private readonly route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      try {
        switch (params.route) {
          case 'block':
            this.dataService = new BlockService(this.apiService)
            this.dataService.setPageSize(10)
            this.page = 'block'
            this.type = 'overview'
            break
          case 'transaction':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'overview'
            break
          case 'activation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['activate_account'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'activate_account'
            break
          case 'origination':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['origination'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'origination_overview'
            break
          case 'delegation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['delegation'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'delegation_overview'
            break
          case 'endorsement':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['endorsement'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'endorsement_overview'
            break
          case 'vote':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind(['ballot', 'proposals'])
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'ballot_overview'
            break
          case 'double-baking':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind('double_baking_evidence')
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'double_baking_evidence_overview'
            break
          case 'double-endorsement':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind('double-endorsement-evidence')
            this.dataService.setPageSize(10)
            this.page = 'transaction'
            this.type = 'double_endorsement_evidence_overview'
            break
          default:
            throw new Error('unknown route')
        }
        this.loading$ = this.dataService.loading$
        this.data$ = this.dataService.list$
        this.componentView = params.route
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn(error)
      }
    })
    this.dataService.setPageSize(10)
  }

  public loadMore(): void {
    ;(this.dataService as any).loadMore()
  }
}
