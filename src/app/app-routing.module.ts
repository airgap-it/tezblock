import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AccountDetailComponent } from './pages/account-detail/account-detail.component'
import { AccountOverviewComponent } from './pages/account-overview/account-overview.component'
import { BakerOverviewComponent } from './pages/baker-overview/baker-overview.component'
import { BlockDetailComponent } from './pages/block-detail/block-detail.component'
import { ContractDetailComponent } from './pages/contract-detail/contract-detail.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EndorsementDetailComponent } from './pages/endorsement-detail/endorsement-detail.component'
import { GlossaryComponent } from './pages/glossary/glossary.component'
import { HealthComponent } from './pages/health/health.component'
import { ListComponent } from './pages/list/list.component'
import { ProposalDetailComponent } from './pages/proposal-detail/proposal-detail.component'
import { ProtocolConstantComponent } from './pages/protocol-constant/protocol-constant.component'
import { WalletsComponent } from './pages/ecosystem/wallets/wallets.component'
import { TokenContractOverviewComponent } from './pages/token-contract-overview/token-contract-overview.component'
import { NodesOnMapComponent } from './pages/nodes-on-map/nodes-on-map.component'
import { TransactionDetailComponent } from './pages/transaction-detail/transaction-detail.component'
import { EcosystemComponent } from './pages/ecosystem/ecosystem.component'
import { DappsComponent } from './pages/ecosystem/dapps/dapps.component'

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'baker/list', component: BakerOverviewComponent },
  { path: 'account/list', component: AccountOverviewComponent },
  { path: 'token-contract/list', component: TokenContractOverviewComponent },
  { path: ':route/list', component: ListComponent },
  { path: 'block/:id', component: BlockDetailComponent },
  { path: 'account/:id', component: AccountDetailComponent },
  { path: 'transaction/:id', component: TransactionDetailComponent },
  { path: 'endorsement/:id', component: EndorsementDetailComponent },
  { path: 'constants', component: ProtocolConstantComponent },
  { path: 'proposal/:id', component: ProposalDetailComponent },
  { path: 'contract/:id', component: ContractDetailComponent },
  { path: 'health', component: HealthComponent },
  { path: 'connected-nodes', component: NodesOnMapComponent },
  { path: 'resources/glossary', component: GlossaryComponent },
  { path: 'ecosystem', component: EcosystemComponent },
  { path: 'ecosystem/wallets', component: WalletsComponent },
  { path: 'ecosystem/dapps', component: DappsComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
