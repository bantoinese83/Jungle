import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/leads/webhook/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
    },
    lead: {
      create: vi.fn(),
    },
  },
}))

// Note: Webhook uses Bearer token auth, not HMAC

describe('POST /api/leads/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Golden Cases', () => {
    it('should create a lead successfully with valid payload', async () => {
      const mockOrg = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Test Org' }
      const mockLead = {
        id: 'lead-123',
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        status: 'pending',
      }

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any)
      vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as any)

      const body = {
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        crmId: 'crm-123',
      }

      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify(body),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.leadId).toBe('lead-123')
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          crmId: 'crm-123',
        }),
      })
    })

    it('should create lead without email when email is optional', async () => {
      const mockOrg = { id: '550e8400-e29b-41d4-a716-446655440000' }
      const mockLead = { id: 'lead-123', email: null }

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any)
      vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as any)

      const body = {
        organizationId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        name: 'Jane Doe',
        phone: '+1234567890',
      }

      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify(body),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should reject request with invalid authorization', async () => {
      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer invalid-token',
        },
        body: JSON.stringify({
          organizationId: 'org-123',
          name: 'John Doe',
          phone: '+1234567890',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should reject request with missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          // Missing name and phone
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid payload')
    })

    it('should reject request with invalid organization ID', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
          name: 'John Doe',
          phone: '+1234567890',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Organization not found')
    })

    it('should handle invalid JSON payload', async () => {
      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: 'invalid json{',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' } as any)
      vi.mocked(prisma.lead.create).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          phone: '+1234567890',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Internal server error')
    })

    it('should handle extremely long input strings', async () => {
      const longString = 'a'.repeat(10000)
      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          name: longString,
          phone: '+1234567890',
        }),
      })

      const response = await POST(request)
      // Should either validate and reject or handle gracefully
      expect([400, 500]).toContain(response.status)
    })

    it('should handle special characters in phone numbers', async () => {
      const mockOrg = { id: '550e8400-e29b-41d4-a716-446655440000' }
      const mockLead = { id: 'lead-123' }

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any)
      vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as any)

      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          phone: '+1 (234) 567-8900',
        }),
      })

      const response = await POST(request)
      // Should handle or normalize phone format
      expect([201, 400]).toContain(response.status)
    })

    it('should handle empty string values', async () => {
      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          name: '',
          phone: '',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should handle null values in payload', async () => {
      const request = new NextRequest('http://localhost/api/leads/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          organizationId: null, // Invalid - should fail UUID validation
          name: 'John Doe',
          phone: '+1234567890',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})

