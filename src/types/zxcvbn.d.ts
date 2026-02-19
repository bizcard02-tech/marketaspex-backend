/**
 * Type definitions for zxcvbn password strength estimator
 * @see https://github.com/dropbox/zxcvbn
 */

declare module "zxcvbn" {
  /**
   * Represents feedback about password strength
   */
  export interface ZXCVBNFeedback {
    /** Warning message about password weakness */
    warning: string
    /** Suggestions to improve password strength */
    suggestions: string[]
  }

  /**
   * Represents a sequence (pattern) found in the password
   */
  export interface ZXCVBNSequence {
    /** The pattern type (e.g., 'dictionary', 'spatial', 'repeat', 'sequence', 'regex', 'date') */
    pattern: string
    /** The matched substring */
    token: string
    /** Starting index of the match */
    i: number
    /** Ending index of the match */
    j: number
    /** Match-specific details */
    [key: string]: any
  }

  /**
   * Represents the result of password strength analysis
   */
  export interface ZXCVBNResult {
    /** Estimated crack time in seconds */
    crackTimesSeconds: {
      /** Online throttled attack (100 guesses per second) */
      onlineThrottling100PerSecond: number
      /** Online unthrottled attack (10 guesses per second) */
      onlineNoThrottling10PerSecond: number
      /** Offline slow hash (10,000 guesses per second) */
      offlineSlowHashing1e4PerSecond: number
      /** Offline fast hash (10 billion guesses per second) */
      offlineFastHashing1e10PerSecond: number
    }
    /** Estimated crack time in human-readable format */
    crackTimesDisplay: {
      /** Online throttled attack */
      onlineThrottling100PerSecond: string
      /** Online unthrottled attack */
      onlineNoThrottling10PerSecond: string
      /** Offline slow hash */
      offlineSlowHashing1e4PerSecond: string
      /** Offline fast hash */
      offlineFastHashing1e10PerSecond: string
    }
    /** Score from 0 (weak) to 4 (strong) */
    score: 0 | 1 | 2 | 3 | 4
    /** Password complexity feedback */
    feedback: ZXCVBNFeedback
    /** Array of detected patterns in the password */
    sequence: ZXCVBNSequence[]
    /** Calculated password complexity */
    calcTime: number
  }

  /**
   * Estimates password strength
   * @param password - The password to analyze
   * @param userInputs - Optional array of user-specific strings to check against (e.g., username, email)
   * @returns A ZXCVBNResult object containing strength analysis
   */
  export default function zxcvbn(
    password: string,
    userInputs?: string[]
  ): ZXCVBNResult
}
