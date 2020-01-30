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
    BakerOverview = 'baker_overview',
    ProposalOverview = 'proposal_overview',

    // these are not operation types...
    Block = 'block'
  }
  
  // TODO: move to more proper place ( separate file ) or try DELETE
  export enum LayoutPages {
    Account = 'account',
    Block = 'block',
    Transaction = 'transaction'
  }
  