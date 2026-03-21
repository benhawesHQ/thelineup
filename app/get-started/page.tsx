"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Mic, MicOff, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo, LogoMark } from "@/components/logo"
import Link from "next/link"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  options?: string[]
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hey! Welcome to The Lineup. I'm going to ask you a few quick questions so I can find opportunities that actually make sense for you.\n\nYou can type, or tap the mic to talk — whatever's easier.",
  options: []
}

const SECOND_MESSAGE: Message = {
  id: "2", 
  role: "assistant",
  content: "So first up — what do you do? What's your main thing?",
  options: ["Speaker / Presenter", "Writer / Author", "Artist / Creative", "Founder / Builder", "Consultant / Expert", "Musician / Performer"]
}

export default function GetStartedPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const [userData, setUserData] = useState<Record<string, string>>({})
  const [showPayment, setShowPayment] = useState(false)
  const [email, setEmail] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Show second message after a delay
  useEffect(() => {
    if (!isInitialized) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, SECOND_MESSAGE])
        setIsInitialized(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join("")
        setInput(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const conversationFlow = [
    {
      question: "And what kind of visibility are you looking for? What would really move the needle for you?",
      options: ["Speaking gigs", "Podcast guest spots", "Getting published", "Brand partnerships", "Grants & funding", "All of the above"]
    },
    {
      question: "What topics or areas are you known for? Or want to be known for?",
      options: []
    },
    {
      question: "What's the big picture goal? Where do you want this to take you?",
      options: []
    },
    {
      question: "Perfect. Drop your email and I'll send your first Lineup this Monday at 9am. First 4 weeks are free.",
      options: []
    }
  ]

  const getSmartResponse = (answer: string, stepNum: number): string => {
    const wordCount = answer.trim().split(/\s+/).length
    const isShort = wordCount < 4
    const isLong = wordCount > 30

    // Handle very short responses
    if (isShort && stepNum !== 4) {
      const shortResponses: Record<number, string[]> = {
        0: [
          "Got it! Quick question though — is that your main focus or more of a side thing?",
          "Nice. Do you do that full-time or alongside something else?"
        ],
        1: [
          "Okay cool. Any particular reason that's the priority right now?",
          "Got it. Is there a specific goal driving that?"
        ],
        2: [
          "Tell me a bit more — like what specific angle or niche?",
          "Interesting. Can you give me a concrete example?"
        ],
        3: [
          "Love it. What would that actually look like for you?",
          "I want to make sure I get this right — can you paint the picture a bit more?"
        ]
      }
      const options = shortResponses[stepNum] || ["Tell me more about that."]
      return options[Math.floor(Math.random() * options.length)]
    }

    // Handle very long responses
    if (isLong) {
      return "Wow, that's a lot — I love the detail! Let me process that."
    }

    // Standard follow-ups based on role selection
    const followUps: Record<number, Record<string, string>> = {
      0: {
        "Speaker / Presenter": "Nice! Speakers have amazing opportunities out there.",
        "Writer / Author": "Love that. Writers can really build an audience through the right placements.",
        "Artist / Creative": "Awesome. The creative space is full of grants, residencies, and collabs.",
        "Founder / Builder": "Perfect. Founders building in public have huge visibility opportunities.",
        "Consultant / Expert": "Great. Positioning yourself as an expert opens a lot of doors.",
        "Musician / Performer": "Cool! Music has so many angles — festivals, podcasts, brand work.",
        "default": "Got it, that works."
      },
      1: {
        "All of the above": "Ha, ambitious. I like it. We'll cast a wide net.",
        "Speaking gigs": "Speaking is huge for building credibility.",
        "Podcast guest spots": "Podcasts are such a good way to reach new audiences.",
        "Getting published": "Bylines can really establish you as a thought leader.",
        "Brand partnerships": "Brand deals can be great for visibility and income.",
        "Grants & funding": "There's way more grant money out there than people realize.",
        "default": "Solid focus."
      },
      2: {
        "default": "That's a great niche to own."
      },
      3: {
        "default": "Love the vision."
      }
    }
    
    return followUps[stepNum]?.[answer] || followUps[stepNum]?.["default"] || "Got it."
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    
    // Store user data
    const stepKeys = ["role", "visibility", "topics", "goals", "email"]
    setUserData(prev => ({ ...prev, [stepKeys[step]]: content.trim() }))

    // Check if this is the email step
    if (step === 4) {
      if (content.includes("@") && content.includes(".")) {
        setEmail(content.trim())
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 1200))
        setIsTyping(false)
        
        const successMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `You're in. Your first Lineup drops this Monday at 9am with 5 handpicked opportunities just for you.\n\nFirst 4 weeks are free. After that it's $9/month to keep them coming.`
        }
        setMessages(prev => [...prev, successMessage])
        setShowPayment(true)
        
        // Submit to API
        try {
          await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: content.trim(),
              name: "",
              location: "",
              interests: [userData.role, userData.visibility].filter(Boolean),
              goals: userData.goals || ""
            })
          })
        } catch {
          // Silently fail - user is already signed up visually
        }
        
        return
      } else {
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 800))
        setIsTyping(false)
        
        const retryMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "That doesn't look quite right — need a valid email to send you the goods."
        }
        setMessages(prev => [...prev, retryMessage])
        return
      }
    }

    setIsTyping(true)
    
    // Simulate natural typing delay
    const thinkingTime = 800 + Math.random() * 1000
    await new Promise(r => setTimeout(r, thinkingTime))
    
    // Get smart response
    const smartResponse = getSmartResponse(content.trim(), step)
    
    // Check if we need to probe more (short answer)
    const wordCount = content.trim().split(/\s+/).length
    const needsMoreInfo = wordCount < 4 && step !== 4
    
    if (needsMoreInfo && Math.random() > 0.3) {
      // Sometimes ask for more detail
      setIsTyping(false)
      const probeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: smartResponse
      }
      setMessages(prev => [...prev, probeMessage])
      // Don't advance step - wait for more info
      return
    }

    setIsTyping(false)

    // Get next question
    const nextStep = step + 1
    const nextQuestion = conversationFlow[nextStep]

    if (nextQuestion) {
      const responseContent = `${smartResponse} ${nextQuestion.question}`

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: responseContent,
        options: nextQuestion.options
      }
      setMessages(prev => [...prev, assistantMessage])
      setStep(nextStep)
    }
  }

  const handleOptionClick = (option: string) => {
    handleSendMessage(option)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-bold text-white">The Lineup</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>2 min setup</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 pt-20 pb-32 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] ${message.role === "user" ? "" : "flex gap-3 w-full md:w-auto"}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shrink-0 mt-1">
                    <LogoMark size={20} />
                  </div>
                )}
                <div className="w-full">
                  <div className={`rounded-2xl px-5 py-4 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-md" 
                      : "bg-secondary/80 text-white rounded-bl-md"
                  }`}>
                    <p className="text-base leading-relaxed whitespace-pre-line">{message.content}</p>
                  </div>
                  
                  {/* Options */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option)}
                          className="px-4 py-2 text-sm rounded-full border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-all cursor-pointer active:scale-95"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
                  <LogoMark size={20} />
                </div>
                <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment CTA */}
          {showPayment && (
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <p className="text-lg text-white font-medium mb-4">Ready to keep the opportunities coming?</p>
              <Button 
                className="w-full h-14 gradient-brand text-white font-semibold text-lg cursor-pointer"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/create-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email })
                    })
                    const data = await res.json()
                    if (data.url) {
                      window.location.href = data.url
                    }
                  } catch {
                    // Handle error
                  }
                }}
              >
                Continue for $9/month
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground mt-3 text-center">Cancel anytime. Seriously.</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Fixed Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-safe">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={step === 6 ? "your@email.com" : "Type or tap mic to talk..."}
                disabled={showPayment}
                rows={1}
                className="w-full min-h-[52px] max-h-32 px-5 py-3.5 pr-14 bg-secondary border border-border rounded-2xl text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none text-base"
                style={{ fontSize: "16px" }} // Prevents iOS zoom
              />
              {/* Voice button inside input */}
              {recognitionRef.current && !showPayment && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
            <Button 
              type="button"
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || showPayment}
              className="h-[52px] w-[52px] gradient-brand text-white cursor-pointer shrink-0 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {isListening ? "Listening... tap mic to stop" : "Press Enter to send"}
          </p>
        </div>
      </div>
    </div>
  )
}
