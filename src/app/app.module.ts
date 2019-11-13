import { isPlatformBrowser } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { APP_ID, Inject, NgModule, PLATFORM_ID } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
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
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { AccountItemComponent } from './components/account-item/account-item.component'
import { AddressItemComponent } from './components/address-item/address-item.component'
import { BlockDetailWrapperComponent } from './components/block-detail-wrapper/block-detail-wrapper.component'
import { BlockItemComponent } from './components/block-item/block-item.component'
import { FooterComponent } from './components/footer/footer.component'
import { HeaderItemComponent } from './components/header-item/header-item.component'
import { IdenticonComponent } from './components/identicon/identicon'
import { LoadingSkeletonComponent } from './components/loading-skeleton/loading-skeleton.component'
import { PricechartItemComponent } from './components/pricechart-item/pricechart-item.component'
import { QrItemComponent } from './components/qr-item/qr-item.component'
import { QrModalComponent } from './components/qr-modal/qr-modal.component'
import { TabbedTableComponent } from './components/tabbed-table/tabbed-table.component'
import { AddressCellComponent } from './components/tezblock-table/address-cell/address-cell.component'
import { AmountCellComponent } from './components/tezblock-table/amount-cell/amount-cell.component'
import { BlockCellComponent } from './components/tezblock-table/block-cell/block-cell.component'
import { HashCellComponent } from './components/tezblock-table/hash-cell/hash-cell.component'
import { PlainValueCellComponent } from './components/tezblock-table/plain-value-cell/plain-value-cell.component'
import { SymbolCellComponent } from './components/tezblock-table/symbol-cell/symbol-cell.component'
import { TezblockTableComponent } from './components/tezblock-table/tezblock-table.component'
import { TimestampCellComponent } from './components/tezblock-table/timestamp-cell/timestamp-cell.component'
import { TransactionDetailWrapperComponent } from './components/transaction-detail-wrapper/transaction-detail-wrapper.component'
import { TransactionItemComponent } from './components/transaction-item/transaction-item.component'
import { addFontAwesome } from './fa-add'
import { AccountDetailComponent } from './pages/account-detail/account-detail.component'
import { BlockDetailComponent } from './pages/block-detail/block-detail.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { ListComponent } from './pages/list/list.component'
import { TransactionDetailComponent } from './pages/transaction-detail/transaction-detail.component'
import { PipesModule } from './pipes/pipes.module'
import { BakingService } from './services/baking/baking.service'
import { BlockService } from './services/blocks/blocks.service'
import { ChartDataService } from './services/chartdata/chartdata.service'
import { CryptoPricesService } from './services/crypto-prices/crypto-prices.service'
import { TelegramModalComponent } from './components/telegram-modal/telegram-modal.component'
import { ResourcesWalletsComponent } from './pages/resources-wallets/resources-wallets.component'
import { ChainNetworkService } from './services/chain-network/chain-network.service'
import { BakerTableComponent } from './components/baker-table/baker-table.component'
import { ExtendTableCellComponent } from './components/tezblock-table/extend-table-cell/extend-table-cell.component';
import { ResourcesWalletItemComponent } from './components/resources-wallet-item/resources-wallet-item.component';
import { ModalCellComponent } from './components/tezblock-table/modal-cell/modal-cell.component'
import { EndorsementDetailComponent } from './pages/endorsement-detail/endorsement-detail.component'
import { StoreModule } from '@ngrx/store'
import { ROOT_REDUCERS, metaReducers } from './reducers'
import { EffectsModule } from '@ngrx/effects'
import { AppEffects } from './app.effects'
import { EndorsementDetailEffects } from './pages/endorsement-detail/effects';
import { TooltipItemComponent } from './components/tooltip-item/tooltip-item.component'

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
    EffectsModule.forRoot([AppEffects, EndorsementDetailEffects])
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
    PricechartItemComponent,
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
    TooltipItemComponent
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
    PricechartItemComponent,
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
