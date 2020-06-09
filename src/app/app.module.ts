import { isPlatformBrowser } from '@angular/common'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { APP_ID, Inject, NgModule, PLATFORM_ID } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { StorageModule } from '@ngx-pwa/local-storage'
import { QRCodeModule } from 'angularx-qrcode'
import { ChartsModule } from 'ng2-charts'
import { AlertModule } from 'ngx-bootstrap/alert'
import { CollapseModule } from 'ngx-bootstrap/collapse'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { PaginationModule } from 'ngx-bootstrap/pagination'
import { ProgressbarModule } from 'ngx-bootstrap/progressbar'
import { SortableModule } from 'ngx-bootstrap/sortable'
import { TabsModule } from 'ngx-bootstrap/tabs'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { TypeaheadModule } from 'ngx-bootstrap/typeahead'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { MomentModule } from 'ngx-moment'
import { ToastrModule } from 'ngx-toastr'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AppEffects } from './app.effects'
import { AccountItemComponent } from './components/account-item/account-item.component'
import { AddressItemComponent } from './components/address-item/address-item.component'
import { BakerTableComponent } from './components/baker-table/baker-table.component'
import { BakerTableEffects } from './components/baker-table/effects'
import { BlockDetailWrapperComponent } from './components/block-detail-wrapper/block-detail-wrapper.component'
import { BlockItemComponent } from './components/block-item/block-item.component'
import { ChartItemComponent } from './components/chart-item/chart-item.component'
import { ClientSideTableComponent } from './components/client-side-table/client-side-table.component'
import { FooterComponent } from './components/footer/footer.component'
import { HeaderItemComponent } from './components/header-item/header-item.component'
import { IdenticonComponent } from './components/identicon/identicon'
import { LoadingSkeletonComponent } from './components/loading-skeleton/loading-skeleton.component'
import { OccurrenceStatisticsComponent } from './components/occurrence-statistics/occurrence-statistics.component'
import { QrItemComponent } from './components/qr-item/qr-item.component'
import { QrModalComponent } from './components/qr-modal/qr-modal.component'
import { ResourcesWalletItemComponent } from './components/resources-wallet-item/resources-wallet-item.component'
import { SearchItemComponent } from './components/search-item/search-item.component'
import { TabbedTableComponent } from './components/tabbed-table/tabbed-table.component'
import { TelegramModalComponent } from './components/telegram-modal/telegram-modal.component'
import { AmountCellComponent } from './components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from './components/tezblock-table/block-cell/block-cell.component'
import { ExtendTableCellComponent } from './components/tezblock-table/extend-table-cell/extend-table-cell.component'
import { HashCellComponent } from './components/tezblock-table/hash-cell/hash-cell.component'
import { ModalCellComponent } from './components/tezblock-table/modal-cell/modal-cell.component'
import { PlainValueCellComponent } from './components/tezblock-table/plain-value-cell/plain-value-cell.component'
import { SymbolCellComponent } from './components/tezblock-table/symbol-cell/symbol-cell.component'
import { TezblockTableComponent } from './components/tezblock-table/tezblock-table.component'
import { TimestampCellComponent } from './components/tezblock-table/timestamp-cell/timestamp-cell.component'
import { TooltipItemComponent } from './components/tooltip-item/tooltip-item.component'
import { TransactionDetailWrapperComponent } from './components/transaction-detail-wrapper/transaction-detail-wrapper.component'
import { TransactionErrorsComponent } from './components/transaction-errors/transaction-errors.component'
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component'
import { addFontAwesome } from './fa-add'
import { AccountDetailComponent } from './pages/account-detail/account-detail.component'
import { AccountDetailEffects } from './pages/account-detail/effects'
import { AccountOverviewComponent } from './pages/account-overview/account-overview.component'
import { AccountsEffects } from './pages/account-overview/effects'
import { BakerOverviewComponent } from './pages/baker-overview/baker-overview.component'
import { BakersEffects } from './pages/baker-overview/effects'
import { BlockDetailComponent } from './pages/block-detail/block-detail.component'
import { BlockDetailEffects } from './pages/block-detail/effects'
import { ContractDetailComponent } from './pages/contract-detail/contract-detail.component'
import { ContractDetailEffects } from './pages/contract-detail/effects'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { DashboarEffects } from './pages/dashboard/effects'
import { DashboardLatestContractsTransactionsEffects } from './pages/dashboard/latest-contracts-transactions/effects'
import { LatestContractsTransactionsComponent } from './pages/dashboard/latest-contracts-transactions/latest-contracts-transactions.component'
import { LatestContractsComponent } from './pages/dashboard/latest-contracts/latest-contracts.component'
import { EndorsementDetailEffects } from './pages/endorsement-detail/effects'
import { EndorsementDetailComponent } from './pages/endorsement-detail/endorsement-detail.component'
import { GlossaryComponent } from './pages/glossary/glossary.component'
import { HealthEffects } from './pages/health/effects'
import { HealthComponent } from './pages/health/health.component'
import { ListEffects } from './pages/list/effects'
import { ListComponent } from './pages/list/list.component'
import { ProposalDetailEffects } from './pages/proposal-detail/effects'
import { ProposalDetailComponent } from './pages/proposal-detail/proposal-detail.component'
import { ProtocolConstantComponent } from './pages/protocol-constant/protocol-constant.component'
import { ResourcesWalletsComponent } from './pages/resources-wallets/resources-wallets.component'
import { TransactionDetailEffects } from './pages/transaction-detail/effects'
import { TransactionDetailComponent } from './pages/transaction-detail/transaction-detail.component'
import { PipesModule } from './pipes/pipes.module'
import { metaReducers, ROOT_REDUCERS } from './reducers'
import { AnalyticsService } from './services/analytics/analytics.service'
import { BakingService } from './services/baking/baking.service'
import { ChainNetworkService } from './services/chain-network/chain-network.service'
import { ChartDataService } from './services/chartdata/chartdata.service'
import { CryptoPricesService } from './services/crypto-prices/crypto-prices.service'
import { TokenContractOverviewComponent } from './pages/token-contract-overview/token-contract-overview.component'
import { TokenContractOverviewEffects } from './pages/token-contract-overview/effects'
import { VarDirective } from '@tezblock/directives/var.directive'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

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
    NgxJsonViewerModule,
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: false // true is default (see comment in baker-table)
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
      ProposalDetailEffects,
      ContractDetailEffects,
      BakersEffects,
      HealthEffects,
      AccountsEffects,
      DashboarEffects,
      DashboardLatestContractsTransactionsEffects,
      TokenContractOverviewEffects
    ]),
    StorageModule.forRoot({ IDBNoWrap: true }),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
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
    BlockCellComponent,
    PlainValueCellComponent,
    AmountCellComponent,
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
    ProtocolConstantComponent,
    ProposalDetailComponent,
    TooltipItemComponent,
    SearchItemComponent,
    OccurrenceStatisticsComponent,
    TezblockTableComponent,
    ClientSideTableComponent,
    ContractDetailComponent,
    BakerOverviewComponent,
    HealthComponent,
    AccountOverviewComponent,
    LatestContractsComponent,
    LatestContractsTransactionsComponent,
    TransactionErrorsComponent,
    TokenContractOverviewComponent,
    GlossaryComponent,
    VarDirective
  ],

  providers: [BakingService, CryptoPricesService, ChartDataService, BsModalService, ChainNetworkService, AnalyticsService],
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
