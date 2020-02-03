import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AccountDetailComponent } from './pages/account-detail/account-detail.component'
import { BlockDetailComponent } from './pages/block-detail/block-detail.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { EndorsementDetailComponent } from './pages/endorsement-detail/endorsement-detail.component'
import { ListComponent } from './pages/list/list.component'
import { ProtocolConstantComponent } from './pages/protocol-constant/protocol-constant.component'
import { ResourcesWalletsComponent } from './pages/resources-wallets/resources-wallets.component'
import { TransactionDetailComponent } from './pages/transaction-detail/transaction-detail.component'
import { ProposalDetailComponent } from './pages/proposal-detail/proposal-detail.component'
import { ContractDetailComponent } from './pages/contract-detail/contract-detail.component'
import { BakerOverviewComponent } from './pages/baker-overview/baker-overview.component'

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'resources/wallets', component: ResourcesWalletsComponent },
  { path: 'baker/list', component: BakerOverviewComponent },
  { path: ':route/list', component: ListComponent },
  { path: 'block/:id', component: BlockDetailComponent },
  { path: 'account/:id', component: AccountDetailComponent },
  { path: 'transaction/:id', component: TransactionDetailComponent },
  { path: 'endorsement/:id', component: EndorsementDetailComponent },
  { path: 'constants', component: ProtocolConstantComponent },
  { path: 'proposal/:id', component: ProposalDetailComponent },
  { path: 'contract/:id', component: ContractDetailComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
