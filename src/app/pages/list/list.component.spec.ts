// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
// import { MomentModule } from 'ngx-moment'
// import { AccountItemComponent } from './../../components/account-item/account-item.component'
// import { BlockItemComponent } from './../../components/block-item/block-item.component'
// import { of } from 'rxjs'
// import { ActivatedRoute, RouterModule } from '@angular/router'
// import { AccountService } from './../../services/account/account.service'
// import { TransactionService } from './../../services/transaction /transaction.service'
// import { BlockService } from './../../services/blocks/blocks.service'
// import { ApiService } from './../../services/api/api.service'
// import { ComponentFixture, TestBed } from '@angular/core/testing'

// import { ListComponent } from './list.component'
// import { UnitHelper } from 'test-config/unit-test-helper'
// import { PaginationComponent, PaginationConfig, TooltipModule } from 'ngx-bootstrap'
// import { TransactionItemComponent } from 'src/app/components/transaction-item/transaction-item.component'
// import { AddressItemComponent } from 'src/app/components/address-item/address-item.component'
// import { IdenticonComponent } from 'src/app/components/identicon/identicon'

// describe('ListComponent', () => {
//   let component: ListComponent
//   let fixture: ComponentFixture<ListComponent>

//   let unitHelper: UnitHelper
//   beforeEach(() => {
//     unitHelper = new UnitHelper()
//     TestBed.configureTestingModule(
//       unitHelper.testBed({
//         providers: [
//           ApiService,
//           BlockService,
//           TransactionService,
//           AccountService,
//           PaginationConfig,
//           {
//             provide: ActivatedRoute,
//             useValue: {
//               params: of({ route: 'transaction' })
//             }
//           }
//         ],
//         imports: [RouterModule, MomentModule, TooltipModule, FontAwesomeModule],
//         declarations: [
//           ListComponent,
//           PaginationComponent,
//           BlockItemComponent,
//           TransactionItemComponent,
//           AccountItemComponent,
//           AddressItemComponent,
//           IdenticonComponent
//         ]
//       })
//     )
//       .compileComponents()
//       .catch(console.error)
//     fixture = TestBed.createComponent(ListComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })
//   it('should create', () => {
//     expect(component).toBeTruthy()
//   })
// })
