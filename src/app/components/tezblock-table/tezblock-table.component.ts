import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  ViewContainerRef
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Observable } from 'rxjs'
import { FormControl } from '@angular/forms'
import { PageChangedEvent } from 'ngx-bootstrap/pagination'

import { Transaction } from '../../interfaces/Transaction'
import { AddressCellComponent } from './address-cell/address-cell.component'
import { AmountCellComponent } from './amount-cell/amount-cell.component'
import { BlockCellComponent } from './block-cell/block-cell.component'
import { ExtendTableCellComponent } from './extend-table-cell/extend-table-cell.component'
import { HashCellComponent } from './hash-cell/hash-cell.component'
import { PlainValueCellComponent } from './plain-value-cell/plain-value-cell.component'
import { SymbolCellComponent } from './symbol-cell/symbol-cell.component'
import { TimestampCellComponent } from './timestamp-cell/timestamp-cell.component'
import { ModalCellComponent } from './modal-cell/modal-cell.component'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Pagination } from '@tezblock/services/facade/facade'

export interface ExpandedRow<Entity, Detail> {
  columns: Column[]
  key: string
  dataSelector: (entity: Entity) => Detail[]
  filterCondition: (detail: Detail, query: string) => boolean
}

interface Column {
  name: string
  property: string
  width?: string
  component?: any
  options?: any
  optionsTransform?(value: any, options: any): any
  transform?(value: any): any
}

export enum LayoutPages {
  Account = 'account',
  Block = 'block',
  Transaction = 'transaction'
}

export enum OperationTypes {
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
  Rewards = 'rewards',
  DoubleBakingEvidenceOverview = 'double_baking_evidence_overview',
  DoubleEndorsementEvidenceOverview = 'double_endorsement_evidence_overview',
  BakerOverview = 'baker_overview'
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
    [OperationTypes.BakerOverview]: Column[]
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
    [OperationTypes.DoubleBakingEvidenceOverview]: Column[]
    [OperationTypes.DoubleEndorsementEvidenceOverview]: Column[]
    [OperationTypes.Ballot]: Column[]
  }
}

const baseTx: Column[] = [
  { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
  { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
]

function getLayouts(showFiat: boolean = true): Layout {
  return {
    [LayoutPages.Account]: {
      [OperationTypes.Transaction]: [
        {
          name: 'From',
          property: 'source',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
        {
          name: 'To',
          property: 'destination',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        { name: 'Amount', property: 'amount', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
          options: { showFullAddress: false, pageId: 'oo' },
          optionsTransform: (value, options) => (!value ? { ...options, isText: true } : options),
          transform: value => value || 'undelegate'
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        { name: 'Amount', property: 'delegatedBalance', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
        { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
        { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent },
        { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent, options: { kind: 'endorsement' } }
      ],
      [OperationTypes.Ballot]: [
        { name: 'Ballot', property: 'ballot', width: '' },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        { name: 'Kind', property: 'kind', width: '' },
        { name: 'Voting Period', property: 'voting_period', width: '' },
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
          transform: (addresses: [string]): number => (addresses ? addresses.length : null)
        },
        {
          name: 'Staking Balance',
          property: 'stakingBalance',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        {
          name: 'Block Rewards',
          property: 'bakingRewards',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        {
          name: 'Endorsement Rewards',
          property: 'endorsingRewards',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: 'Fees', property: 'fees', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
        { name: '', property: 'expand', width: '', component: ExtendTableCellComponent }
      ],
      [OperationTypes.BakingRights]: [
        { name: 'Cycle', property: 'cycle', width: '' },
        { name: '# of Bakings', property: 'bakingsCount', width: '' },
        {
          name: 'Block Rewards',
          property: 'blockRewards',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: 'Deposits', property: 'bakingDeposits', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
        { name: 'Fees', property: 'fees', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
        { name: '', property: 'expand', width: '', component: ExtendTableCellComponent }
      ],
      [OperationTypes.EndorsingRights]: [
        { name: 'Cycle', property: 'cycle', width: '' },
        { name: '# of Endorsements', property: 'endorsementsCount', width: '' },
        {
          name: 'Endorsement Rewards',
          property: 'endorsementRewards',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        {
          name: 'Deposits',
          property: 'endorsingDeposits',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: '', property: 'expand', width: '', component: ExtendTableCellComponent }
      ],
      [OperationTypes.BakerOverview]: [
        { name: 'Baker', property: 'pkh', width: '', component: AddressCellComponent },
        { name: 'Balance', property: 'balance', width: '', component: AmountCellComponent },
        { name: '# of Votes', property: 'number_of_votes', width: '' },
        { name: 'Staking Balance', property: 'staking_balance', width: '', component: AmountCellComponent },
        { name: '# of Delegators', property: 'number_of_delegators', width: '' }
      ]
    },
    [LayoutPages.Block]: {
      [OperationTypes.Transaction]: [
        {
          name: 'From',
          property: 'source',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
        {
          name: 'To',
          property: 'destination',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: 'Amount', property: 'amount', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
        { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
        { name: 'Gas Limit', property: 'gas_limit', width: '' },
        { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
      ],
      [OperationTypes.Overview]: [
        {
          name: 'Baker',
          property: 'baker',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        { name: 'Transaction Volume', property: 'volume', width: '', component: AmountCellComponent },
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
          options: { showFullAddress: false, pageId: 'oo' },
          optionsTransform: (value, options) => (!value ? { ...options, isText: true } : options),
          transform: value => value || 'undelegate'
        },
        { name: 'Amount', property: 'delegatedBalance', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
        { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
        { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
        { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent, options: { kind: 'endorsement' } }
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
        {
          name: 'From',
          property: 'source',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
        {
          name: 'To',
          property: 'destination',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: 'Amount', property: 'amount', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
        { name: 'Fee', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
        { name: 'Gas Limit', property: 'gas_limit', width: '' },
        { name: 'Storage Limit', property: 'storage_limit', width: '' },
        { name: 'Parameters', property: 'parameters', width: '', component: ModalCellComponent },
        { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent }
      ],

      [OperationTypes.Overview]: [
        {
          name: 'From',
          property: 'source',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: '', property: 'applied', width: '1', component: SymbolCellComponent },
        {
          name: 'To',
          property: 'destination',
          width: '1',
          component: AddressCellComponent,
          options: { showFullAddress: false, pageId: 'oo' }
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },

        { name: 'Amount', property: 'amount', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
        { name: 'Fees', property: 'fee', width: '', component: AmountCellComponent, options: { showFiatValue: false } },
        { name: 'Parameters', property: 'parameters', width: '', component: ModalCellComponent },
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
          options: { showFullAddress: false, pageId: 'oo' },
          optionsTransform: (value, options) => (!value ? { ...options, isText: true } : options),
          transform: value => value || 'undelegate'
        },
        { name: 'Value', property: 'delegatedBalance', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
          options: { showFullAddress: false, pageId: 'oo' },
          optionsTransform: (value, options) => (!value ? { ...options, isText: true } : options),
          transform: value => value || 'undelegate'
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        { name: 'Value', property: 'amount', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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

        { name: 'Balance', property: 'originatedBalance', width: '', component: AmountCellComponent, options: { showFiatValue: showFiat } },
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
          options: { showFullAddress: false, pageId: 'oo' },
          optionsTransform: (value, options) => (!value ? { ...options, isText: true } : options),
          transform: value => value || 'undelegate'
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
        { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent, options: { kind: 'endorsement' } }
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
        { name: 'Voting Period', property: 'voting_period', width: '' },
        { name: '# of Votes', property: 'votes', width: '' },
        { name: 'Proposal Hash', property: 'proposal', width: '', component: HashCellComponent },
        ...baseTx
      ],
      [OperationTypes.DoubleBakingEvidenceOverview]: [
        {
          name: 'Baker',
          property: '',
          width: '',
          component: AddressCellComponent
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        {
          name: 'Reward',
          property: '',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: 'Offender', property: '', width: '', component: AddressCellComponent },
        { name: 'Denounced Level', property: '', width: '', component: BlockCellComponent },
        {
          name: 'Lost Amount',
          property: '',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: 'Level', property: 'block_level', width: '', component: BlockCellComponent },
        { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
      ],
      [OperationTypes.DoubleEndorsementEvidenceOverview]: [
        {
          name: 'Baker',
          property: '',
          width: '',
          component: AddressCellComponent
        },
        { name: 'Age', property: 'timestamp', width: '', component: TimestampCellComponent },
        {
          name: 'Reward',
          property: '',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: 'Offender', property: '', width: '', component: AddressCellComponent },
        { name: 'Denounced Level', property: '', width: '', component: BlockCellComponent },
        {
          name: 'Lost Amount',
          property: '',
          width: '',
          component: AmountCellComponent,
          options: { showFiatValue: showFiat }
        },
        { name: 'Level', property: 'block_level', width: '', component: BlockCellComponent },
        { name: 'Tx Hash', property: 'operation_group_hash', width: '', component: HashCellComponent }
      ],
      [OperationTypes.Ballot]: [
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
        { name: 'Voting Period', property: 'voting_period', width: '' },
        { name: '# of Votes', property: 'votes', width: '' },
        { name: 'Proposal Hash', property: 'proposal', width: '', component: HashCellComponent },
        { name: 'Block', property: 'block_level', width: '', component: BlockCellComponent }
      ]
    }
  }
}

@Component({
  selector: 'tezblock-table',
  templateUrl: './tezblock-table.component.html',
  styleUrls: ['./tezblock-table.component.scss']
})
export class TezblockTableComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChildren('dynamic', { read: ViewContainerRef }) cells?: QueryList<ViewContainerRef>

  config: Column[] = []
  transactions: Transaction[] = []
  loading$: Observable<boolean>
  filterTerm: FormControl
  isMainnet: boolean = false
  expandedRows: any[] = []
  expandedRowData: { [key: string]: any[] } = {}
  expandedRowsPage: Pagination[] = []

  @Input()
  set data(transactions: Transaction[] | undefined) {
    if (transactions !== this.transactions) {
      this.transactions = transactions
    }
  }

  @Input()
  loading: boolean

  @Input()
  showLoadMoreButton?: boolean = false
  @Input()
  page?: LayoutPages
  @Input()
  type?: OperationTypes
  @Input()
  enableSearch?: false

  @Input()
  expandedRow?: ExpandedRow<any, any>

  @Output()
  readonly loadMoreClicked: EventEmitter<void> = new EventEmitter()

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    readonly router: Router,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.isMainnet = this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  ngOnInit() {
    this.filterTerm = new FormControl('')
  }

  isExpanded(transaction: Transaction): boolean {
    return this.expandedRow && this.expandedRows.includes(transaction[this.expandedRow.key])
  }

  ngAfterViewInit() {
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

  expand(transaction: Transaction) {
    if (this.expandedRow) {
      const key = transaction[this.expandedRow.key]
      const isExpaned = this.expandedRows.includes(key)

      // collapse
      if (isExpaned) {
        this.expandedRows = this.expandedRows.filter(expandedRow => expandedRow !== key)

        return
      }

      // expane
      const data = this.expandedRow.dataSelector(transaction)

      this.expandedRows = this.expandedRows.concat(key)
      this.expandedRowData[key.toString()] = data.slice(0, 10)
      this.expandedRowsPage[key] = {
        selectedSize: undefined,
        currentPage: 1,
        pageSizes: undefined,
        total: data.length
      }
    }
  }

  filterTransactions(transaction: Transaction) {
    const key = transaction[this.expandedRow.key]
    const filteredData = this.expandedRow
      .dataSelector(transaction)
      .filter(item => this.expandedRow.filterCondition(item, this.filterTerm.value))

    this.expandedRowData[key.toString()] = filteredData.slice(0, 10)
    this.expandedRowsPage[key] = {
      selectedSize: undefined,
      currentPage: 1,
      pageSizes: undefined,
      total: filteredData.length
    }
  }

  pageChanged(event: PageChangedEvent, transaction: Transaction): void {
    const key = transaction[this.expandedRow.key]
    const startItem = (event.page - 1) * event.itemsPerPage
    const endItem = event.page * event.itemsPerPage
    const data = this.expandedRow.dataSelector(transaction)

    // QUESTION: should I take under account filtering here ?
    this.expandedRowData[key.toString()] = data.slice(startItem, endItem)
    this.expandedRowsPage[key] = {
      selectedSize: undefined,
      currentPage: event.page,
      pageSizes: undefined,
      total: data.length
    }
  }

  renderComponents() {
    if (this.cells) {
      for (let i = 0; i < this.cells.toArray().length; i++) {
        const target = this.cells.toArray()[i]

        const cellType = this.config[i % this.config.length]
        const transaction = this.transactions[Math.floor(i / this.config.length)]
        const data = transaction[cellType.property]

        const widgetComponent = this.componentFactoryResolver.resolveComponentFactory(
          cellType.component ? cellType.component : PlainValueCellComponent
        )

        target.clear()

        const cmpRef: ComponentRef<any> = target.createComponent(widgetComponent)

        cmpRef.instance.data =
          cellType.component === ExtendTableCellComponent
            ? this.isExpanded(transaction)
            : cellType.transform
            ? cellType.transform(data)
            : data

        const options = cellType.optionsTransform ? cellType.optionsTransform(data, cellType.options) : cellType.options

        if (options) {
          if (options.pageId) {
            options.pageId = this.activatedRoute.snapshot.paramMap.get('id')
          }
          cmpRef.instance.options = options
          if (options.pageId) {
            cmpRef.instance.checkId()
          }
        }
      }
    }
  }

  ngOnChanges() {
    if (this.page && this.type) {
      const layouts = getLayouts(this.isMainnet)
      if (layouts[this.page][this.type]) {
        this.config = layouts[this.page][this.type]
      } else {
        this.config = []
      }
    }
  }

  loadMore() {
    this.loadMoreClicked.emit()
  }

  trackByFn(index, item: Transaction) {
    // transaction
    if (['transaction', 'delegation', 'origination', 'endorsement', 'ballot'].includes(this.type)) {
      return item.operation_group_hash + item.timestamp
    }

    return item
  }
}
