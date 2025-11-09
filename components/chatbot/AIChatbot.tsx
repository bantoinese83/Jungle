'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface LeadQualification {
  crm?: string
  challenge?: string
  fit?: 'high' | 'medium' | 'low' | null
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you learn about Jungle and see if it's a good fit for your business. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [, setQualification] = useState<LeadQualification>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsTyping(true)

    // Track chatbot message sent
    trackEvent('chatbot_message_sent', {
      message: currentInput,
      messageCount: messages.length + 1,
    })

    try {
      // Call OpenAI API via backend
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update qualification based on response
      if (data.qualification) {
        setQualification((prev) => ({ ...prev, ...data.qualification }))
      }

      // Track chatbot response received
      trackEvent('chatbot_response_received', {
        responseLength: data.text.length,
        hasQualification: !!data.qualification,
        fit: data.qualification?.fit,
      })

      // Auto-suggest signup for high-fit leads
      if (data.qualification?.fit === 'high') {
        setTimeout(() => {
          const signupMessage: Message = {
            role: 'assistant',
            content:
              "Based on your needs, Jungle sounds like a great fit! Would you like to start a free 14-day trial? No credit card required.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, signupMessage])
          
          trackEvent('chatbot_high_fit_lead', {
            crm: data.qualification.crm,
            challenge: data.qualification.challenge,
          })
        }, 1000)
      }

      setIsTyping(false)
    } catch (error) {
      console.error('Chatbot error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again or contact support.',
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
      
      trackEvent('chatbot_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          trackEvent('chatbot_opened')
        }}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition z-50"
        aria-label="Open chatbot"
        aria-expanded={isOpen}
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Jungle Assistant</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            trackEvent('chatbot_closed', {
              messageCount: messages.length,
              conversationDuration: messages.length > 0 
                ? (Date.now() - messages[0].timestamp.getTime()) / 1000 
                : 0,
            })
          }}
          className="hover:bg-emerald-700 rounded p-1 transition"
          aria-label="Close chatbot"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.role === 'assistant' &&
                (message.content.includes('trial') || message.content.includes('sign up')) && (
                  <a
                    href="/signup"
                    onClick={() => trackEvent('chatbot_cta_clicked', { cta: 'signup', source: 'chatbot' })}
                    className="mt-2 inline-block bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Start Free Trial
                  </a>
                )}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

