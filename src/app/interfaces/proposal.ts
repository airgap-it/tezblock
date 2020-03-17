// interfaces folder should be renamed to model

export const proposals: { [key: string]: { alias: string; discussionLink?: string } } = require('../../assets/proposals/json/proposals.json')

export interface ProposalListDto {
  count_operation_group_hash: string
  proposal: string
  period: number
}

export interface ProposalDto {
  proposal: string
  period: number
  discussionLink?: string
}

export const toAlias = (name: string): string => {
  const match = proposals[name]

  return match ? match.alias : null
}
