export type LeadStatus = 'pending' | 'called_by_human' | 'ai_triggered'

export type IntegrationType = 'gohighlevel' | 'retell_ai' | 'close'

export interface Lead {
  id: string
  organizationId: string
  crmId?: string | null
  name: string
  phone: string
  email?: string | null
  status: LeadStatus
  receivedAt: Date
  firstCallAt?: Date | null
  aiCallTriggeredAt?: Date | null
  speedToLeadMinutes?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationDashboardSummary {
  totalLeads: number
  aiCallsTriggered: number
  averageSpeedToLead: number
  recentLeads: Lead[]
}

