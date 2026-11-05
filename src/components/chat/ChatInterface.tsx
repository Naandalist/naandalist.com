import React, { useState, useRef, useEffect } from 'react'
import { Send, User } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EXAMPLE_MESSAGES } from '@/consts'

// Same photo as the author profile (src/content/authors/naandalist.md).
const AVATAR = 'https://avatars.githubusercontent.com/u/14960087?v=4'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello, I'm Naandalist! 👋  \nThis chatbot is smart, but not perfect and could be wrong. Feel free to ask me anything! 😊",
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Local times differ from the server's, so timestamps are drawn only after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isInitialRender = useRef(true)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (preset?: string) => {
    const contentToSend = (preset ?? inputValue).trim()
    if (!contentToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: contentToSend,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    if (!preset) setInputValue('')
    setIsLoading(true)

    try {
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (response.status === 429) {
        try {
          const data = await response.json()
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: typeof data?.message === 'string' ? data.message : 'You have reached the daily chat limit (20 per day). Try again tomorrow.',
            sender: 'bot',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, botMessage])
          setRateLimited(true)
          return
        } catch {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'You have reached the daily chat limit (20 per day). Try again tomorrow.',
            sender: 'bot',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, botMessage])
          setRateLimited(true)
          return
        }
      }

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      const botMessageId = (Date.now() + 1).toString()
      let botContent = ''

      const initialBotMessage: Message = {
        id: botMessageId,
        content: '',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, initialBotMessage])

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const jsonStr = line.slice(2)
              const data = JSON.parse(jsonStr)
              if (data.type === 'text-delta' && data.textDelta) {
                botContent += data.textDelta
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === botMessageId ? { ...msg, content: botContent } : msg,
                  ),
                )
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Card className="flex-1 flex flex-col min-h-[50dvh] rounded-xl border-muted-foreground/20 bg-muted/20 backdrop-blur">
        <CardContent className="flex-1 flex flex-col p-4 sm:p-6 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                <div
                  className={`max-w-[92%] sm:max-w-[80%] rounded-xl px-4 py-3 shadow-1 border ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'bg-transparent text-card-foreground border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.sender === 'bot' ? (
                      <img
                        src={AVATAR}
                        alt="Naandalist"
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <User className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {message.sender === 'bot' ? (
                        <div className="text-sm leading-relaxed prose dark:prose-invert max-w-none wrap-break-word **:my-0 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p+p]:mt-2 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-xs">
                          <Streamdown mode={isLoading && message.id === messages[messages.length - 1]?.id ? 'streaming' : 'static'}>
                            {message.content}
                          </Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed wrap-break-word">{message.content}</p>
                      )}
                      <p className="text-xs sm:text-xs opacity-70 mt-1">
                        {mounted && message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[92%] sm:max-w-[80%] rounded-xl px-4 py-3 bg-transparent border shadow-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={AVATAR}
                      alt="Naandalist"
                      className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover"
                    />
                    <div className="flex space-x-1 text-muted-foreground">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:120ms]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Example messages */}
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_MESSAGES.map(({ heading, message, icon: Icon }) => (
              <Button
                key={heading}
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full px-3 py-2"
                onClick={() => handleSendMessage(message)}
                disabled={isLoading || rateLimited}
                title={heading}
              >
                <Icon className="mr-2 h-4 w-4" /> {heading}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="mt-4 flex gap-2 items-end">
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Write your message..."
              className="flex-1 min-h-[44px] max-h-10 px-3 py-2 text-base border border-input bg-background rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoading || rateLimited}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading || rateLimited}
              size="sm"
              className="px-3 py-2 min-h-[44px] max-h-10 bg-primary"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
