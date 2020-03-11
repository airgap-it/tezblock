import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AccountOverviewComponent } from './account-overview.component'
import { LoadingSkeletonComponent } from '@tezblock/components/loading-skeleton/loading-skeleton.component'
import { ChartItemComponent } from '@tezblock/components/chart-item/chart-item.component'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { IdenticonComponent } from '@tezblock/components/identicon/identicon'
import { AccountItemComponent } from '@tezblock/components/account-item/account-item.component'
import { AddressItemComponent } from '@tezblock/components/address-item/address-item.component'
import { AmountCellComponent } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { ChartsModule } from 'ng2-charts'

describe('AccountOverviewComponent', () => {
  let component: AccountOverviewComponent
  let fixture: ComponentFixture<AccountOverviewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AccountOverviewComponent,
        LoadingSkeletonComponent,
        ChartItemComponent,
        TezblockTableComponent,
        IdenticonComponent,
        AccountItemComponent,
        AddressItemComponent,
        AmountCellComponent,
        BlockCellComponent,
        SymbolCellComponent,
        HashCellComponent,
        ModalCellComponent,
        ExtendTableCellComponent
      ],
      imports: [FontAwesomeModule, ChartsModule]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
