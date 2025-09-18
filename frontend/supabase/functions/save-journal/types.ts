/**
 * TypeScript types for the save-journal edge function
 * Matches the public.journals table schema
 */

export interface JournalEntryRequest {
  journal_entry: string
  thinking_traps?: Record<string, any>
}

export interface JournalEntryResponse {
  success: boolean
  entry?: {
    id: number
    created_at: string
    journal_entry: string
    user_id: string
    thinking_traps?: Record<string, any>
  }
  error?: string
}

export interface DatabaseJournalEntry {
  id: number
  created_at: string
  journal_entry: string
  user_id: string
  thinking_traps?: Record<string, any>
}
