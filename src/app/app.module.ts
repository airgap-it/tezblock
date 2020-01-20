import { isPlatformBrowser } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { APP_ID, Inject, NgModule, PLATFORM_ID } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { QRCodeModule } from 'angularx-qrcode'
import { ChartsModule } from 'ng2-charts'
import { AlertModule, BsDropdownModule, BsModalService, CollapseModule, SortableModule, TooltipModule } from 'ngx-bootstrap'
import { ModalModule } from 'ngx-bootstrap/modal'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { TypeaheadModule } from 'ngx-bootstrap/typeahead'
import { MomentModule } from 'ngx-moment'
import { ToastrModule } from 'ngx-toastr'
import { StorageModule } from '@ngx-pwa/local-storage'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AppEffects } from './app.effects'
import { AccountItemComponent } from './components/account-item/account-item.component'
import { AddressItemComponent } from './components/address-item/address-item.component'
import { BakerTableComponent } from './components/baker-table/baker-table.component'
import { BlockDetailWrapperComponent } from './components/block-detail-wrapper/block-detail-wrapper.component'
import { BlockItemComponent } from './components/block-item/block-item.component'
import { FooterComponent } from './components/footer/footer.component'
import { HeaderItemComponent } from './components/header-item/header-item.component'
import { IdenticonComponent } from './components/identicon/identicon'
import { LoadingSkeletonComponent } from './components/loading-skeleton/loading-skeleton.component'
import { ChartItemComponent } from './components/chart-item/chart-item.component'
import { QrItemComponent } from './components/qr-item/qr-item.component'
import { QrModalComponent } from './components/qr-modal/qr-modal.component'
import { ResourcesWalletItemComponent } from './components/resources-wallet-item/resources-wallet-item.component'
import { TabbedTableComponent } from './components/tabbed-table/tabbed-table.component'
import { TelegramModalComponent } from './components/telegram-modal/telegram-modal.component'
import { AddressCellComponent } from './components/tezblock-table/address-cell/address-cell.component'
import { AmountCellComponent } from './components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from './components/tezblock-table/block-cell/block-cell.component'
import { ExtendTableCellComponent } from './components/tezblock-table/extend-table-cell/extend-table-cell.component'
import { HashCellComponent } from './components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from './components/tezblock-table/modal-cell/modal-cell.component'
import { PlainValueCellComponent } from './components/tezblock-table/plain-value-cell/plain-value-cell.component'
import { SearchItemComponent } from './components/search-item/search-item.component'
import { SymbolCellComponent } from './components/tezblock-table/symbol-cell/symbol-cell.component'
import { TezblockTableComponent } from './components/tezblock-table/tezblock-table.component'
import { TimestampCellComponent } from './components/tezblock-table/timestamp-cell/timestamp-cell.component'
import { TooltipItemComponent } from './components/tooltip-item/tooltip-item.component'
import { TransactionDetailWrapperComponent } from './components/transaction-detail-wrapper/transaction-detail-wrapper.component'
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component'
import { addFontAwesome } from './fa-add'
import { AccountDetailComponent } from './pages/account-detail/account-detail.component'
import { BlockDetailComponent } from './pages/block-detail/block-detail.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EndorsementDetailEffects } from './pages/endorsement-detail/effects'
import { EndorsementDetailComponent } from './pages/endorsement-detail/endorsement-detail.component'
import { ListComponent } from './pages/list/list.component'
import { ResourcesWalletsComponent } from './pages/resources-wallets/resources-wallets.component'
import { TransactionDetailComponent } from './pages/transaction-detail/transaction-detail.component'
import { PipesModule } from './pipes/pipes.module'
import { metaReducers, ROOT_REDUCERS } from './reducers'
import { BakingService } from './services/baking/baking.service'
import { BlockService } from './services/blocks/blocks.service'
import { ChainNetworkService } from './services/chain-network/chain-network.service'
import { ChartDataService } from './services/chartdata/chartdata.service'
import { CryptoPricesService } from './services/crypto-prices/crypto-prices.service'
import { ListEffects } from './pages/list/effects'
import { AccountDetailEffects } from './pages/account-detail/effects'
import { BlockDetailEffects } from './pages/block-detail/effects'
import { TransactionDetailEffects } from './pages/transaction-detail/effects'
import { BakerTableEffects } from './components/baker-table/effects';
import { ProposalDetailComponent } from './pages/proposal-detail/proposal-detail.component'
import { ProposalDetailEffects } from './pages/proposal-detail/effects'
import { OccurrenceStatisticsComponent } from './components/occurrence-statistics/occurrence-statistics.component';
import { TezblockTable2Component } from './components/tezblock-table2/tezblock-table2.component';
import { ClientSideTableComponent } from './components/client-side-table/client-side-table.component'

@NgModule({
  imports: [
    AlertModule.forRoot(),
    TabsModule.forRoot(),
    SortableModule.forRoot(),
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 4000,
      preventDuplicates: true
    }),
    CollapseModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    PipesModule,
    MomentModule,
    TypeaheadModule.forRoot(),
    QRCodeModule,
    ModalModule.forRoot(),
    FontAwesomeModule,
    ChartsModule,
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    EffectsModule.forRoot([
      AppEffects,
      EndorsementDetailEffects,
      ListEffects,
      AccountDetailEffects,
      BakerTableEffects,
      BlockDetailEffects,
      TransactionDetailEffects,
      ProposalDetailEffects
    ]),
    StorageModule.forRoot({ IDBNoWrap: true })
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    ListComponent,
    BlockItemComponent,
    FooterComponent,
    IdenticonComponent,
    TransactionItemComponent,
    AccountItemComponent,
    AccountDetailComponent,
    BlockDetailComponent,
    TransactionDetailComponent,
    AddressItemComponent,
    HeaderItemComponent,
    QrItemComponent,
    QrModalComponent,
    TezblockTableComponent,
    BlockCellComponent,
    PlainValueCellComponent,
    AmountCellComponent,
    AddressCellComponent,
    TimestampCellComponent,
    HashCellComponent,
    SymbolCellComponent,
    ChartItemComponent,
    TabbedTableComponent,
    BlockDetailWrapperComponent,
    TransactionDetailWrapperComponent,
    LoadingSkeletonComponent,
    TelegramModalComponent,
    BakerTableComponent,
    ResourcesWalletsComponent,
    ExtendTableCellComponent,
    ResourcesWalletItemComponent,
    ModalCellComponent,
    EndorsementDetailComponent,
    SearchItemComponent,
    ProposalDetailComponent,
    TooltipItemComponent,
    SearchItemComponent,
    OccurrenceStatisticsComponent,
    TezblockTable2Component,
    ClientSideTableComponent
  ],

  providers: [BakingService, BlockService, CryptoPricesService, ChartDataService, BsModalService, ChainNetworkService],
  entryComponents: [
    BlockItemComponent,
    IdenticonComponent,
    TransactionItemComponent,
    ListComponent,
    AccountItemComponent,
    AddressItemComponent,
    QrModalComponent,
    TelegramModalComponent,
    QrItemComponent,
    BlockCellComponent,
    PlainValueCellComponent,
    AmountCellComponent,
    AddressCellComponent,
    TimestampCellComponent,
    HashCellComponent,
    SymbolCellComponent,
    ChartItemComponent,
    ExtendTableCellComponent,
    ModalCellComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object, @Inject(APP_ID) private readonly appId: string) {
    const platform = isPlatformBrowser(platformId) ? 'in the browser' : 'on the server'
    // tslint:disable-next-line:no-console
    console.log(`Running ${platform} with appId=${appId}`)
    addFontAwesome()
  }
}
