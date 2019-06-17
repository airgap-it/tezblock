export interface Baker {
  voting: string
  rank: number
  baker_name: string
  delegation_code: string
  fee: string
  baker_efficiency: string
  available_capacity: string
  accepting_delegation: string
  nominal_staking_yield: string
}

export interface TezosBakerResponse {
  bakers: Baker[]
}
