/**
 * Password validation utility
 * Enforces strong password requirements to prevent weak passwords
 */

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

// List of common passwords to reject
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty', 'admin', 'letmein', 'welcome',
  'monkey', '1234567890', 'password123', 'admin123', 'Password1',
  'Password123', 'Welcome1', 'Welcome123', 'password1', 'admin1',
  'letmein123', 'qwerty123', 'abc123', 'football', 'iloveyou'
]

/**
 * Validate password strength and requirements
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Minimum length check
  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  } else {
    score++
    if (password.length >= 16) score++
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score++
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score++
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score++
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)')
  } else {
    score++
  }

  // Check against common passwords (case-insensitive)
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
    errors.push('Password is too common. Please choose a more unique password')
    score = Math.max(0, score - 2)
  }

  // Check for repeated characters (e.g., "aaa", "111")
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., "aaa", "111")')
    score = Math.max(0, score - 1)
  }

  // Check for sequential characters (e.g., "abc", "123")
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789/i.test(password)) {
    errors.push('Password should not contain sequential characters (e.g., "abc", "123")')
    score = Math.max(0, score - 1)
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 6) {
    strength = 'strong'
  } else if (score >= 4) {
    strength = 'medium'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Get password strength tips
 */
export function getPasswordStrengthTips(): string[] {
  return [
    'Use at least 12 characters (16+ is better)',
    'Include uppercase and lowercase letters',
    'Include numbers and special characters',
    'Avoid common words and phrases',
    'Avoid repeated or sequential characters',
    'Consider using a passphrase (multiple words)',
    'Use a password manager to generate and store secure passwords'
  ]
}

/**
 * Generate a password strength meter value (0-100)
 */
export function getPasswordStrengthScore(password: string): number {
  const result = validatePasswordStrength(password)

  if (result.strength === 'strong') return 100
  if (result.strength === 'medium') return 60
  return 30
}
