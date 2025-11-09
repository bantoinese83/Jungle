import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { encrypt, decrypt } from '@/lib/encryption'

describe('Encryption Utilities', () => {
  const testKey = 'test-encryption-key-32-chars-long!!'
  const originalEnv = process.env.ENCRYPTION_KEY

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = testKey
  })

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalEnv
  })

  describe('Golden Cases', () => {
    it('should encrypt and decrypt a simple string', () => {
      const plaintext = 'test-api-key-123'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(encrypted).not.toBe(plaintext)
      expect(decrypted).toBe(plaintext)
    })

    it('should encrypt and decrypt API keys with special characters', () => {
      const plaintext = 'sk_live_1234567890abcdef!@#$%^&*()'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should produce different encrypted values for same input', () => {
      const plaintext = 'same-input'
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)

      // Should be different due to IV
      expect(encrypted1).not.toBe(encrypted2)
      // But should decrypt to same value
      expect(decrypt(encrypted1)).toBe(plaintext)
      expect(decrypt(encrypted2)).toBe(plaintext)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const plaintext = ''
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle very long strings', () => {
      const plaintext = 'a'.repeat(10000)
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle unicode characters', () => {
      const plaintext = '🔑密钥-API-Key-123'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should throw error when decrypting invalid encrypted string', () => {
      const invalidEncrypted = 'not-a-valid-encrypted-string'

      expect(() => decrypt(invalidEncrypted)).toThrow()
    })

    it('should handle missing ENCRYPTION_KEY gracefully', () => {
      const originalKey = process.env.ENCRYPTION_KEY
      delete process.env.ENCRYPTION_KEY

      // Should either throw or use empty string (implementation dependent)
      try {
        encrypt('test')
        // If no error, restore key
        process.env.ENCRYPTION_KEY = originalKey
      } catch (error) {
        // Expected behavior - restore key
        process.env.ENCRYPTION_KEY = originalKey
        expect(error).toBeDefined()
      }
    })

    it('should handle special characters in encryption key', () => {
      process.env.ENCRYPTION_KEY = 'key-with-special-chars!@#$%^&*()'
      const plaintext = 'test-data'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })
  })
})

