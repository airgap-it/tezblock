export interface BalanceUpdate {
  category: string
  change: number
  contract?: any
  delegate: string
  id: number
  kind: string
  level: number
  source: string
  source_hash?: string
  source_id: number
}
