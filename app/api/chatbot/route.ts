import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const SYSTEM_PROMPT = `You are a helpful assistant for Jungle, an AI-powered speed to lead automation platform. Your role is to:

1. Answer questions about Jungle's features, pricing, and integrations
2. Qualify leads by asking about their CRM, challenges, and needs
3. Guide qualified leads to signup or demo
4. Provide helpful information about speed to lead automation

Key information about Jungle:
- Automatically calls leads within minutes using AI
- Integrates with GoHighLevel, Close, HubSpot, and other CRMs
- Uses Retell AI for automated calling
- Pricing: Starter ($99/mo), Professional ($299/mo), Enterprise (custom)
- 14-day free trial, no credit card required
- Main value: Never miss a lead by calling within 5 minutes

When qualifying leads:
- Ask about their current CRM
- Understand their biggest challenge with lead follow-up
- Categorize as high/medium/low fit
- For high-fit leads, suggest signup or demo

Be friendly, helpful, and concise. Always offer to help with signup or demo when appropriate.`

export async function POST(request: NextRequest) {
  let message = ''
  let conversationHistory: unknown[] = []
  
  try {
    const body = await request.json()
    message = body.message || ''
    conversationHistory = body.conversationHistory || []

    if (!message || typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is required and must be less than 5000 characters' },
        { status: 400 }
      )
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      // Fallback to rule-based responses if OpenAI not configured
      return NextResponse.json({
        text: generateFallbackResponse(message),
        qualification: null,
      })
    }

    // Build conversation history for context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory
        .filter((msg): msg is { role: string; content: string } => 
          typeof msg === 'object' && msg !== null && 'role' in msg && 'content' in msg
        )
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      { role: 'user', content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

    // Extract qualification hints from response
    const qualification = extractQualification(message, responseText)

    return NextResponse.json({
      text: responseText,
      qualification,
    })
  } catch (error) {
    console.error('Chatbot API error:', error)
    
    // Fallback to rule-based responses on error
    // Use stored message if available, otherwise empty string
    return NextResponse.json({
      text: generateFallbackResponse(message),
      qualification: null,
    })
  }
}

function extractQualification(userMessage: string, aiResponse: string): {
  crm?: string
  challenge?: string
  fit?: 'high' | 'medium' | 'low'
} | null {
  const lowerMessage = userMessage.toLowerCase()
  const lowerResponse = aiResponse.toLowerCase()
  
  const qualification: { crm?: string; challenge?: string; fit?: 'high' | 'medium' | 'low' } = {}

  // Detect CRM
  if (lowerMessage.includes('gohighlevel') || lowerMessage.includes('ghl')) {
    qualification.crm = 'GoHighLevel'
    qualification.fit = 'high'
  } else if (lowerMessage.includes('close')) {
    qualification.crm = 'Close'
    qualification.fit = 'high'
  } else if (lowerMessage.includes('hubspot')) {
    qualification.crm = 'HubSpot'
    qualification.fit = 'high'
  } else if (lowerMessage.includes('crm')) {
    qualification.fit = 'medium'
  }

  // Detect challenges
  if (lowerMessage.includes('slow') || lowerMessage.includes('response time')) {
    qualification.challenge = 'response_time'
    qualification.fit = qualification.fit || 'high'
  } else if (lowerMessage.includes('miss') || lowerMessage.includes('after hours')) {
    qualification.challenge = 'coverage'
    qualification.fit = qualification.fit || 'high'
  }

  // Detect high intent
  if (lowerResponse.includes('signup') || lowerResponse.includes('trial') || lowerResponse.includes('demo')) {
    qualification.fit = 'high'
  }

  return Object.keys(qualification).length > 0 ? qualification : null
}

function generateFallbackResponse(message: string): string {
  const lowerInput = message.toLowerCase()

  if (lowerInput.includes('how does') && lowerInput.includes('work')) {
    return "Jungle automatically calls leads within your set threshold (e.g., 5 minutes). When a lead comes in via your CRM, our AI calls them, qualifies them, and schedules follow-ups if needed. It works 24/7, so you never miss a lead."
  } else if (lowerInput.includes('gohighlevel') || lowerInput.includes('ghl')) {
    return "Yes! Jungle integrates seamlessly with GoHighLevel. Just connect your GHL API key in the onboarding process, and we'll automatically receive new leads via webhook. Would you like to see how the integration works?"
  } else if (lowerInput.includes('crm') || lowerInput.includes('integration')) {
    return "Jungle supports multiple CRM integrations including GoHighLevel, Close, HubSpot, and more. What CRM are you currently using?"
  } else if (lowerInput.includes('pricing') || lowerInput.includes('cost') || lowerInput.includes('price')) {
    return "Jungle offers three plans: Starter ($99/mo), Professional ($299/mo), and Enterprise (custom). All plans include a 14-day free trial. Would you like to see the full feature comparison?"
  } else if (lowerInput.includes('trial') || lowerInput.includes('sign up') || lowerInput.includes('start')) {
    return "Great! You can start your free 14-day trial right now. No credit card required. I'll guide you through the setup process. Ready to get started?"
  } else {
    return "I can help you with questions about how Jungle works, CRM integrations, pricing, or setting up a free trial. What would you like to know?"
  }
}

