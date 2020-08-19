import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { provideMockStore, MockStore } from '@ngrx/store/testing'
import { Store } from '@ngrx/store'

import { LatestContractsTransactionsComponent } from './latest-contracts-transactions.component'
import { initialState as lctInitialState } from './reducer'
import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { TokenContract } from '@tezblock/domain/contract'

describe('LatestContractTransactionsComponent', () => {
  let component: LatestContractsTransactionsComponent
  let fixture: ComponentFixture<LatestContractsTransactionsComponent>
  let storeMock: MockStore<any>
  let store: Store<fromRoot.State>
  const initialState = { dashboardLatestContractsTransactions: lctInitialState }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LatestContractsTransactionsComponent],
      providers: [provideMockStore({ initialState })]
    })

    fixture = TestBed.createComponent(LatestContractsTransactionsComponent)
    component = fixture.componentInstance
    storeMock = TestBed.inject(MockStore)
    store = TestBed.inject(Store)
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('contracts', () => {
    it('when setter value length is grater than 0 then dispatches loadTransferOperations action', () => {
      const value: TokenContract[] = [
        {
          symbol: 'foo',
          name: 'foo',
          website: 'foo',
          description: 'foo',
          socials: []
        }
      ]

      spyOn(store, 'dispatch')

      component.contracts = value

      expect(store.dispatch).toHaveBeenCalledWith(actions.loadTransferOperations({ contracts: value }))
    })

    it('when setter value length is 0 then does not dispatch loadTransferOperations action', () => {
      const value: TokenContract[] = []

      spyOn(store, 'dispatch')

      component.contracts = value

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })
})
