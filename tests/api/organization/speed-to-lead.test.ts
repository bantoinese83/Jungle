import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/organization/speed-to-lead/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    organization: {
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase/server')

describe('POST /api/organization/speed-to-lead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Golden Cases', () => {
    it('should update speed to lead threshold successfully', async () => {
      const mockUser = { id: 'user-123' }
      const mockDbUser = { id: 'db-user-123', organizationId: 'org-123' }
      const mockOrg = { id: 'org-123', speedToLeadMinutes: 5 }

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const mockFindUnique = vi.fn().mockResolvedValue(mockDbUser as any)
      const mockUpdate = vi.fn().mockResolvedValue({
        ...mockOrg,
        speedToLeadMinutes: 10,
      } as any)
      ;(prisma.user.findUnique as unknown) = mockFindUnique
      ;(prisma.organization.update as unknown) = mockUpdate

      const request = new NextRequest('http://localhost/api/organization/speed-to-lead', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          speedToLeadMinutes: 10,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should reject negative values', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/organization/speed-to-lead', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          speedToLeadMinutes: -5,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should reject zero value', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/organization/speed-to-lead', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          speedToLeadMinutes: 0,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should reject values exceeding maximum (60)', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/organization/speed-to-lead', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          speedToLeadMinutes: 100,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should reject non-integer values', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/organization/speed-to-lead', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          speedToLeadMinutes: 5.5,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should reject missing user', async () => {
      const mockUser = { id: 'user-123' }
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      } as any)

      const mockFindUnique = vi.fn().mockResolvedValue(null)
      ;(prisma.user.findUnique as unknown) = mockFindUnique

      const request = new NextRequest('http://localhost/api/organization/speed-to-lead', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          speedToLeadMinutes: 10,
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(404)
    })
  })
})

