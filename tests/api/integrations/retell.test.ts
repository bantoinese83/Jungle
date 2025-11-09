import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/integrations/retell/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/prisma')
vi.mock('@/lib/encryption')
vi.mock('@/lib/supabase/server')

describe('POST /api/integrations/retell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Golden Cases', () => {
    it('should save Retell AI API key successfully', async () => {
      const mockUser = { id: 'user-123' }
      const mockDbUser = { id: 'db-user-123', organizationId: 'org-123' }
      const mockIntegration = { id: 'int-123', type: 'retell_ai' }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const mockFindUnique = vi.fn().mockResolvedValue(mockDbUser as any)
      const mockUpsert = vi.fn().mockResolvedValue(mockIntegration as any)
      ;(prisma.user.findUnique as unknown) = mockFindUnique
      ;(prisma.integration.upsert as unknown) = mockUpsert
      vi.mocked(encrypt).mockReturnValue('encrypted-key')

      const request = new NextRequest('http://localhost/api/integrations/retell', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'retell-api-key-123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(encrypt).toHaveBeenCalledWith('retell-api-key-123')
    })
  })

  describe('Edge Cases', () => {
    it('should reject request without authentication', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/integrations/retell', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'retell-api-key-123',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should reject empty API key', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/integrations/retell', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: '',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid payload')
    })

    it('should handle encryption failures', async () => {
      const mockUser = { id: 'user-123' }
      const mockDbUser = { id: 'db-user-123', organizationId: 'org-123' }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const mockFindUnique = vi.fn().mockResolvedValue(mockDbUser as any)
      ;(prisma.user.findUnique as unknown) = mockFindUnique
      vi.mocked(encrypt).mockImplementation(() => {
        throw new Error('Encryption failed')
      })

      const request = new NextRequest('http://localhost/api/integrations/retell', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'retell-api-key-123',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })
})

