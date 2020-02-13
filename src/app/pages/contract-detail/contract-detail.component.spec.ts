import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { ContractDetailComponent } from './contract-detail.component'
import { UnitHelper } from 'test-config/unit-test-helper'
import { AddressItemComponent } from './../../components/address-item/address-item.component'
import { IdenticonComponent } from '@tezblock/components/identicon/identicon'
import { IconPipe } from 'src/app/pipes/icon/icon.pipe'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { TezblockTableComponent } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { BlockCellComponent } from '@tezblock/components/tezblock-table/block-cell/block-cell.component'
import { SymbolCellComponent } from '@tezblock/components/tezblock-table/symbol-cell/symbol-cell.component'
import { HashCellComponent } from '@tezblock/components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from '@tezblock/components/tezblock-table/modal-cell/modal-cell.component'
import { ExtendTableCellComponent } from '@tezblock/components/tezblock-table/extend-table-cell/extend-table-cell.component'
import { LoadingSkeletonComponent } from '@tezblock/components/loading-skeleton/loading-skeleton.component'
import { AmountCellComponent } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { AddressCellComponent } from '@tezblock/components/tezblock-table/address-cell/address-cell.component'

describe('ContractDetailComponent', () => {
  let component: ContractDetailComponent
  let fixture: ComponentFixture<ContractDetailComponent>

  beforeEach(async(() => {
    const unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [FontAwesomeModule],
        declarations: [
          ContractDetailComponent,
          AddressItemComponent,
          IdenticonComponent,
          TezblockTableComponent,
          BlockCellComponent,
          SymbolCellComponent,
          HashCellComponent,
          ModalCellComponent,
          ExtendTableCellComponent,
          AddressItemComponent,
          LoadingSkeletonComponent,
          AmountCellComponent,
          AddressCellComponent
        ],
        providers: [IconPipe, AliasPipe]
      })
    ).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
