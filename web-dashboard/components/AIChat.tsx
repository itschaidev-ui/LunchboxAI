'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PaperAirplaneIcon, SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  taskPlan?: any
  needsConfirmation?: boolean
  pendingTaskInput?: string
}

interface AIChatProps {
  onTaskCreated?: (task: any) => void
  className?: string
}

export default function AIChat({ onTaskCreated, className = '' }: AIChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "🍱 Hi there! I'm Lunchbox AI, your friendly productivity assistant! I can help you with tasks, studying, and getting things done. What would you like to work on today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [pendingTaskInput, setPendingTaskInput] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateUniqueId(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Check if the message is asking for task creation
      const isTaskRequest = isTaskCreationRequest(input.trim())
      
      if (isTaskRequest) {
        await handleTaskCreation(input.trim())
      } else {
        await handleGeneralChat(input.trim())
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: generateUniqueId(),
        type: 'ai',
        content: "🍱 Oops! I had trouble processing your request. Please try again!",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const isTaskCreationRequest = (message: string): boolean => {
    // Check for time/date patterns that suggest a task
    const timePatterns = [
      /\b(friday|saturday|sunday|monday|tuesday|wednesday|thursday)\b/i,
      /\b\d{1,2}:\d{2}\s*(am|pm)\b/i,
      /\b\d{1,2}\/\d{1,2}\b/,
      /\b(today|tomorrow|next week|this week)\b/i
    ]
    
    const taskKeywords = [
      'have to', 'need to', 'going to', 'soccer', 'meeting', 'appointment',
      'deadline', 'due', 'event', 'practice', 'game', 'work', 'study'
    ]
    
    const hasTimePattern = timePatterns.some(pattern => pattern.test(message))
    const hasTaskKeyword = taskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
    
    return hasTimePattern && hasTaskKeyword
  }

  const isTaskConfirmationRequest = (message: string): boolean => {
    // Check if AI is asking for task/reminder confirmation
    const confirmationPatterns = [
      /would you like to create/i,
      /create.*task/i,
      /create.*reminder/i,
      /set.*reminder/i,
      /add.*task/i,
      /schedule.*task/i
    ]
    
    return confirmationPatterns.some(pattern => pattern.test(message))
  }

  const handleTaskCreation = async (taskInput: string) => {
    try {
      // Fix grammar in the task input
      const correctedInput = taskInput
        .replace(/^i /, 'I ')
        .replace(/ i /g, ' I ')
        .replace(/ i$/g, ' I')
      
      // First, ask for confirmation instead of creating immediately
      const aiMessage: Message = {
        id: generateUniqueId(),
        type: 'ai',
        content: `I detected a task: "${correctedInput}". Would you like me to create this task for you?`,
        timestamp: new Date(),
        needsConfirmation: true,
        pendingTaskInput: correctedInput
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      throw error
    }
  }

  const confirmTaskCreation = async (taskInput: string) => {
    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskInput,
          userContext: {
            level: 1,
            xp: 0,
            streak: 0
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: generateUniqueId(),
          type: 'ai',
          content: data.message,
          timestamp: new Date(),
          taskPlan: data.task
        }
        setMessages(prev => [...prev, aiMessage])

        // Call the callback if provided
        if (onTaskCreated) {
          onTaskCreated(data.task)
        }
      } else {
        // Show error message to user instead of throwing
        const errorMessage: Message = {
          id: generateUniqueId(),
          type: 'ai',
          content: `Sorry, I couldn't create that task: ${data.error}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        return
      }
    } catch (error) {
      // Show error message to user instead of throwing
      const errorMessage: Message = {
        id: generateUniqueId(),
        type: 'ai',
        content: 'Sorry, something went wrong while creating your task. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Error creating task:', error)
    }
  }

  const handleGeneralChat = async (message: string) => {
    try {
      // Get recent conversation context (last 6 messages)
      const recentMessages = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: recentMessages,
          userId: (session?.user as any)?.discordId,
          userXp: 0,
          userLevel: 1,
          userStreak: 0
        }),
      })

      const data = await response.json()

      if (data.response) {
        const isConfirmationRequest = isTaskConfirmationRequest(data.response)
        
        const aiMessage: Message = {
          id: generateUniqueId(),
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          needsConfirmation: isConfirmationRequest,
          pendingTaskInput: isConfirmationRequest ? message : undefined
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('No response from AI')
      }
    } catch (error) {
      throw error
    }
  }

  const formatMessage = (message: Message) => {
    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-gradient-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-2xl max-w-xs lg:max-w-md">
            <p className="text-sm">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )
    }

    if (message.type === 'ai') {
      return (
        <div className="flex justify-start mb-4">
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🍱</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl max-w-xs lg:max-w-md border border-orange-200/50">
              <p className="text-sm text-gray-800">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
              {message.needsConfirmation && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => confirmTaskCreation(message.pendingTaskInput!)}
                    className="bg-green-500/80 hover:bg-green-500 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-medium transition-all duration-200 hover:shadow-lg"
                  >
                    Yes, Create Task
                  </button>
                  <button
                    onClick={() => {
                      // Remove the confirmation message
                      setMessages(prev => prev.filter(m => m.id !== message.id))
                    }}
                    className="bg-gray-500/80 hover:bg-gray-500 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-medium transition-all duration-200 hover:shadow-lg"
                  >
                    No, Cancel
                  </button>
                </div>
              )}
              {message.taskPlan && (
                <div className="mt-3 p-3 bg-orange-50 backdrop-blur-sm rounded-lg border border-orange-200/50">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">
                    📋 Task Plan Created
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>{message.taskPlan.title}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {message.taskPlan.completion_steps.length} steps • 
                    {message.taskPlan.category} • 
                    ~{Math.round(message.taskPlan.estimated_duration / 60)}min
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`flex flex-col h-full bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-orange-200/50">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🍱</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Lunchbox AI</h3>
          <p className="text-xs text-gray-600">Your productivity assistant</p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs text-gray-600">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {formatMessage(message)}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🍱</span>
              </div>
              <div className="bg-orange-50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-orange-200/50">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-orange-200/50">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to help with tasks, studying, or anything else..."
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none text-gray-800 placeholder-gray-500"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-500 hover:to-orange-600 backdrop-blur-sm text-white rounded-xl disabled:bg-gray-400/60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setInput("Help me study for my upcoming test")}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-all duration-200 backdrop-blur-sm border border-blue-200"
          >
            <AcademicCapIcon className="w-3 h-3" />
            <span>Study Help</span>
          </button>
          <button
            onClick={() => setInput("I need to organize my tasks for this week")}
            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition-all duration-200 backdrop-blur-sm border border-green-200"
          >
            <SparklesIcon className="w-3 h-3" />
            <span>Task Planning</span>
          </button>
        </div>
      </div>
    </div>
  )
}
