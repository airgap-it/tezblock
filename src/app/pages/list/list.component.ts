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
            this.page = 'block'
            this.type = 'overview'
            break
          case 'transaction':
            this.dataService = new TransactionService(this.apiService)
            this.page = 'transaction'
            this.type = 'overview'
            break
          case 'activation':
            this.dataService = new TransactionService(this.apiService)
            this.dataService.updateKind('activate_account')
            this.page = 'transaction'
            this.type = 'activate_account'
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
