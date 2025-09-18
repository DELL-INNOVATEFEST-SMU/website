/**
 * Type definitions for the Journal Image Generator Edge Function
 */

/**
 * Request payload for journal image generation
 */
export interface JournalImageRequest {
  journalEntry: string
  thinkingTraps?: string[]
}

/**
 * Response payload for journal image generation
 */
export interface JournalImageResponse {
  success: boolean
  imageBase64?: string
  error?: string
  canGenerate: boolean
  timestamp: string
}

/**
 * Gemini Image API response interface
 * Based on the JavaScript documentation structure
 */
export interface GeminiImageResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string
        inlineData?: {
          data: string // Base64 image data
          mimeType?: string
        }
      }>
    }
    finishReason?: string
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  }>
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  }
}
