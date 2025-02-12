import type { z } from 'zod'
import type { PostStatusSchema, ProgressStatusSchema, SyndicateStatusSchema } from '../schemas/schemas.js'

export type PostStatus = z.infer<typeof PostStatusSchema>

export type ProgressStatus = z.infer<typeof ProgressStatusSchema>

export type SyndicateStatus = z.infer<typeof SyndicateStatusSchema>

export interface StatusDetails {
  status?: string
  message: string
  trace?: string
}
