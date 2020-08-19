// interfaces folder should be renamed to model

// I'm not using: import * as data from thanks to flag "allowSyntheticDefaultImports": true in tsconfig.jsom ( resolves default property problem )
import data from '../../assets/proposals/json/proposals.json'

export const proposals: {
  [key: string]: { alias: string; discussionLink?: string }
} = data

export interface ProposalDto {
  proposal: string
  period: number
  discussionLink?: string
  description?: string
}

export const toAlias = (name: string): string => {
  const match = proposals[name]

  return match ? match.alias : null
}
