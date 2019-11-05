import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  ViewChildren,
  ViewContainerRef
} from '@angular/core'
import { Router } from '@angular/router'
import { Observable, Subscription } from 'rxjs'

import { Transaction } from '../../interfaces/Transaction'

import { AddressCellComponent } from './address-cell/address-cell.component'
import { AmountCellComponent } from './amount-cell/amount-cell.component'
import { BlockCellComponent } from './block-cell/block-cell.component'
import { ExtendTableCellComponent } from './extend-table-cell/extend-table-cell.component'
import { HashCellComponent } from './hash-cell/hash-cell.component'
import { PlainValueCellComponent } from './plain-value-cell/plain-value-cell.component'
import { SymbolCellComponent } from './symbol-cell/symbol-cell.component'
import { TimestampCellComponent } from './timestamp-cell/timestamp-cell.component'

interface Column {
  name: string
  property: string
  width: string
  component?: any // TODO: any
  options?: any // TODO: any, boolean?
  transform?(value: any): any
}

enum LayoutPages {
  Account = 'account',
  Block = 'block',
  Transaction = 'transaction'
}

enum OperationTypes {
  Transaction = 'transaction',
  Delegation = 'delegation',
  Origination = 'origination',
  Endorsement = 'endorsement',
  Reveal = 'reveal',
  Ballot = 'ballot',
  BallotOverview = 'ballot_overview',
  BakingRights = 'baking_rights',
  EndorsingRights = 'endorsing_rights',
  Activation = 'activate_account',
  Overview = 'overview',
  OriginationOverview = 'origination_overview',
  DelegationOverview = 'delegation_overview',
  EndorsementOverview = 'endorsement_overview',
  Rewards = 'rewards'
}

interface Layout {
  [LayoutPages.Account]: {
    [OperationTypes.Transaction]: Column[]
    [OperationTypes.Delegation]: Column[]
    [OperationTypes.Origination]: Column[]
    [OperationTypes.Endorsement]: Column[]
    [OperationTypes.Ballot]: Column[]
    [OperationTypes.Rewards]: Column[]
    [OperationTypes.BakingRights]: Column[]
    [OperationTypes.EndorsingRights]: Column[]
  }
  [LayoutPages.Block]: {
    [OperationTypes.Transaction]: Column[]
    [OperationTypes.Overview]: Column[]
    [OperationTypes.Delegation]: Column[]
    [OperationTypes.Origination]: Column[]
    [OperationTypes.Endorsement]: Column[]
    [OperationTypes.Activation]: Column[]
  }
  [LayoutPages.Transaction]: {
    [OperationTypes.Transaction]: Column[]
    [OperationTypes.Overview]: Column[]
    [OperationTypes.Delegation]: Column[]
    [OperationTypes.DelegationOverview]: Column[]
    [OperationTypes.Origination]: Column[]
    [OperationTypes.OriginationOverview]: Column[]
    [OperationTypes.Reveal]: Column[]
    [OperationTypes.Activation]: Column[]
    [OperationTypes.EndorsementOverview]: Column[]
    [OperationTypes.BallotOverview]: Column[]
  }
}

const baseTx: Column[] = [
  { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
  { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
]

const layouts: Layout = {
  [LayoutPages.Account]: {
    [OperationTypes.Transaction]: [
      { name: 'From', property: 'source', width: '1', component: AddressCellComponent, options: { showFullAddress: false, pageId: 'oo' } },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'To',
        property: 'destination',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Value', property: 'amount', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      ...baseTx
    ],
    [OperationTypes.Delegation]: [
      {
        name: 'Delegator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Value', property: 'delegatedBalance', width: '', component: AmountCellComponent },
      ...baseTx
    ],
    [OperationTypes.Origination]: [
      {
        name: 'New Account',
        property: 'originated_contracts',
        width: '',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      {
        name: 'Originator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      ...baseTx
    ],
    [OperationTypes.Endorsement]: [
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Slots', property: 'slots', width: '' },
      { name: 'Endorsed Level', property: 'level', width: '', component: BlockCellComponent },
      ...baseTx
    ],
    [OperationTypes.Ballot]: [
      { name: 'Ballot', property: 'ballot', width: '' },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Kind', property: 'kind', width: '' },
      { name: 'Voting Period', property: '', width: '' },
      { name: '# of Votes', property: 'votes', width: '' },
      { name: 'Proposal Hash', property: 'proposal', width: '', component: HashCellComponent },
      ...baseTx
    ],
    [OperationTypes.Rewards]: [
      { name: 'Cycle', property: 'cycle', width: '' },
      {
        name: 'Delegations',
        property: 'delegatedContracts',
        width: '',
        component: PlainValueCellComponent,
        transform: (addresses: [string]): number => addresses.length
      },
      { name: 'Staking Balance', property: 'stakingBalance', width: '', component: AmountCellComponent },
      { name: 'Block Rewards', property: 'bakingRewards', width: '', component: AmountCellComponent },
      { name: 'Endorsement Rewards', property: 'endorsingRewards', width: '', component: AmountCellComponent },
      { name: 'Fees', property: 'fees', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: '', property: 'expand', width: '', component: ExtendTableCellComponent }
    ],
    [OperationTypes.BakingRights]: [
      { name: 'Cycle', property: 'cycle', width: '' },
      { name: 'Level', property: 'level', width: '', component: BlockCellComponent },
      { name: 'Priority', property: 'priority', width: '', component: PlainValueCellComponent },
      { name: 'Rewards', property: '', width: '', component: AmountCellComponent },
      { name: 'Fees', property: '', width: '', component: AmountCellComponent },
      { name: 'Time', property: 'estimated_time', width: '', component: TimestampCellComponent },
      {
        name: 'Delegate',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Block Hash', property: 'block_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.EndorsingRights]: [
      { name: 'Cycle', property: 'cycle', width: '' },
      { name: 'For Level', property: 'level', width: '', component: BlockCellComponent },
      { name: 'Included Level', property: '', width: '', component: BlockCellComponent },
      { name: 'Slot', property: 'slot', width: '' },
      { name: 'Rewards', property: '', width: '', component: AmountCellComponent },
      { name: 'Time', property: 'estimated_time', width: '', component: TimestampCellComponent },
      {
        name: 'Delegate',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Block Hash', property: 'block_hash', width: '', component: HashCellComponent }
    ]
  },
  [LayoutPages.Block]: {
    [OperationTypes.Transaction]: [
      { name: 'From', property: 'source', width: '1', component: AddressCellComponent, options: { showFullAddress: false, pageId: 'oo' } },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'To',
        property: 'destination',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Value', property: 'amount', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],

    // TODO
    [OperationTypes.Overview]: [
      { name: 'Baker', property: 'baker', width: '1', component: AddressCellComponent, options: { showFullAddress: false, pageId: 'oo' } },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Value', property: 'volume', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Transactions', property: 'txcount', width: '' },
      { name: 'Fitness', property: 'fitness', width: '' },
      { name: 'Block', property: 'level', width: '', component: BlockCellComponent }
    ],
    [OperationTypes.Delegation]: [
      {
        name: 'Delegator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Value', property: 'delegatedBalance', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.Origination]: [
      {
        name: 'New Account',
        property: 'originated_contracts',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent },
      {
        name: 'Originator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent },
      { name: 'Burn', property: 'burn', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.Endorsement]: [
      {
        name: 'Endorser',
        property: 'delegate',
        width: '',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Slots', property: 'slots', width: '' },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.Activation]: [
      {
        name: 'Account',
        property: 'pkh',
        width: '',
        component: AddressCellComponent,
        options: { showFullAddress: true, pageId: 'oo' }
      },
      { name: 'Secret', property: 'secret', width: '' },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ]
  },
  [LayoutPages.Transaction]: {
    [OperationTypes.Transaction]: [
      { name: 'From', property: 'source', width: '1', component: AddressCellComponent, options: { showFullAddress: false, pageId: 'oo' } },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'To',
        property: 'destination',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Value', property: 'amount', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Storage Limit', property: 'storage_limit', width: '' },
      { name: 'Parameters', property: 'parameters', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent }
    ],

    [OperationTypes.Overview]: [
      { name: 'From', property: 'source', width: '1', component: AddressCellComponent, options: { showFullAddress: false, pageId: 'oo' } },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'To',
        property: 'destination',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },

      { name: 'Value', property: 'amount', width: '', component: AmountCellComponent },
      { name: 'Fees', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Parameters', property: 'parameters', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],

    [OperationTypes.Activation]: [
      { name: 'Account', property: 'pkh', width: '1', component: AddressCellComponent, options: { showFullAddress: true, pageId: 'oo' } },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Secret', property: 'secret', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.Delegation]: [
      {
        name: 'Delegator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Value', property: 'delegatedBalance', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Storage Limit', property: 'storage_limit', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent }
    ],
    [OperationTypes.DelegationOverview]: [
      {
        name: 'Delegator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Value', property: 'amount', width: '', component: AmountCellComponent },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.Origination]: [
      {
        name: 'New Account',
        property: 'originated_contracts',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent },
      {
        name: 'Originator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Burn', property: 'burn', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Storage Limit', property: 'storage_limit', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent }
    ],
    [OperationTypes.OriginationOverview]: [
      {
        name: 'New Account',
        property: 'originated_contracts',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },

      { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent },
      {
        name: 'Originator',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      {
        name: 'Baker',
        property: 'delegate',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.Reveal]: [
      {
        name: 'Account',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Public Key', property: 'public_key', width: '1', component: AddressCellComponent, options: { showFullAddress: false } },
      { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
      { name: 'Gas Limit', property: 'gas_limit', width: '' },
      { name: 'Storage Limit', property: 'storage_limit', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent }
    ],
    [OperationTypes.EndorsementOverview]: [
      {
        name: 'Endorser',
        property: 'delegate',
        width: '',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Slots', property: 'slots', width: '' },
      { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
      { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
    ],
    [OperationTypes.BallotOverview]: [
      {
        name: 'Baker',
        property: 'source',
        width: '1',
        component: AddressCellComponent,
        options: { showFullAddress: false, pageId: 'oo' }
      },
      { name: 'Ballot', property: 'ballot', width: '' },
      { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
      { name: 'Kind', property: 'kind', width: '' },
      { name: 'Voting Period', property: '', width: '' },
      { name: '# of Votes', property: 'votes', width: '' },
      { name: 'Proposal Hash', property: 'proposal', width: '', component: HashCellComponent },
      ...baseTx
    ]
  }
}

@Component({
  selector: 'tezblock-table',
  templateUrl: './tezblock-table.component.html',
  styleUrls: ['./tezblock-table.component.scss']
})
export class TezblockTableComponent implements OnChanges, AfterViewInit {
  @ViewChildren('dynamic', { read: ViewContainerRef }) public cells?: QueryList<ViewContainerRef>

  public config: Column[] = []

  public transactions$: Observable<Transaction[]> = new Observable()
  public transactions: Transaction[] = []
  public loading$: Observable<boolean> = new Observable()
  private subscription: Subscription
  public filterTerm: string | undefined
  public backupTransactions: Transaction[] = []

  @Input()
  set data(value: Observable<Transaction[]> | undefined) {
    if (value) {
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
      this.transactions$ = value
      this.subscription = this.transactions$.subscribe(transactions => {
        this.backupTransactions = transactions
        this.transactions = transactions
      })
    }
  }

  @Input()
  set loading(value: Observable<boolean> | undefined) {
    if (value) {
      this.loading$ = value
    }
  }

  @Input()
  public showLoadMoreButton?: boolean = false
  @Input()
  public page?: LayoutPages
  @Input()
  public type?: OperationTypes
  @Input()
  public enableSearch?: false

  @Output()
  public readonly loadMoreClicked: EventEmitter<void> = new EventEmitter()

  constructor(private readonly componentFactoryResolver: ComponentFactoryResolver, public readonly router: Router) {}

  public ngAfterViewInit() {
    if (this.cells) {
      this.cells.changes.subscribe(t => {
        if (t.length > 0) {
          setTimeout(() => {
            this.renderComponents()
          }, 300) // TODO: Find a better way than this. # of votes might not display if the timeout is not sufficiently long
        }
      })
    }
  }

  public expand(transaction: any) {
    transaction.expand = transaction.expand ? false : true
  }

  public filterTransactions(filterTerm: string) {
    if (filterTerm) {
      const filteredTransactions: any[] = this.backupTransactions.map((transaction: any) => {
        transaction.payouts = transaction.payouts.filter(payout => payout.delegator === filterTerm)

        return transaction
      })

      this.transactions = filteredTransactions
    }
  }

  public renderComponents() {
    if (this.cells) {
      for (let i = 0; i < this.cells.toArray().length; i++) {
        const target = this.cells.toArray()[i]

        const cellType = this.config[i % this.config.length]

        let ownId: string = this.router.url
        const split = ownId.split('/')
        ownId = split.slice(-1).pop()

        const data = (this.transactions[Math.floor(i / this.config.length)] as any)[cellType.property]

        const widgetComponent = this.componentFactoryResolver.resolveComponentFactory(
          cellType.component ? cellType.component : PlainValueCellComponent
        )

        target.clear()

        const cmpRef: ComponentRef<any> = target.createComponent(widgetComponent) // TODO: <any>

        cmpRef.instance.data = cellType.transform ? cellType.transform(data) : data
        if (cellType.options) {
          if (cellType.options.pageId) {
            cellType.options.pageId = ownId
          }
          cmpRef.instance.options = cellType.options
          if (cellType.options.pageId) {
            cmpRef.instance.checkId()
          }
        }
      }
    }
  }

  public ngOnChanges() {
    // console.log('type of page:', this.type)
    if (this.page && this.type) {
      if (layouts[this.page][this.type]) {
        // tslint:disable-next-line:no-console
        // console.log('have layout for type ', this.type)
        // console.log('have layout for page ', this.page)

        this.config = layouts[this.page][this.type]
      } else {
        // tslint:disable-next-line:no-console
        console.log(`NO layout for page ${this.page} and type ${this.type}`)
        // tslint:disable-next-line:no-console
        console.log('layouts[this.page]', layouts[this.page])
        this.config = []
      }
    }
  }

  public loadMore() {
    this.loadMoreClicked.emit()
  }
}
