"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Mic, MicOff, ArrowRight, Sparkles, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo, LogoMark } from "@/components/logo"
import Link from "next/link"

interface Opportunity {
  title: string
  link: string
  type: string
  deadline?: string
  reason: string
}

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  options?: string[]
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hey! So glad you're here. I'm going to ask you a few quick questions so I can find opportunities that are actually perfect for YOU.\n\nType or tap the mic — whatever feels right.",
  options: []
}

const SECOND_MESSAGE: Message = {
  id: "2", 
  role: "assistant",
  content: "Alright, let's do this! What do you do? What's your main thing?",
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
  const [lineup, setLineup] = useState<Opportunity[]>([])
  const [isLoadingLineup, setIsLoadingLineup] = useState(false)
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
      question: "Love it! Now what kind of visibility would really move the needle for you right now?",
      options: ["Speaking gigs", "Podcast guest spots", "Getting published", "Brand partnerships", "Grants & funding", "All of the above"]
    },
    {
      question: "This is exciting! What topics or areas are you known for? Or want to be known for?",
      options: []
    },
    {
      question: "I can already see some great opportunities for you. What's the big picture goal? Where do you want this to take you?",
      options: []
    },
    {
      question: "I've got some amazing stuff lined up for you already. Drop your email and I'll show you your first 5 opportunities right now — plus send them to your inbox!",
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
          "That's awesome! Tell me a bit more — is that your main focus?",
          "Love it! Is that full-time or something you're building on the side?"
        ],
        1: [
          "Great choice! Why is that the priority right now?",
          "Smart! What's driving that focus?"
        ],
        2: [
          "Ooh interesting! Tell me more about your specific angle?",
          "That's cool! Can you give me a concrete example?"
        ],
        3: [
          "I love that vision! What would that actually look like for you?",
          "That's inspiring! Paint the picture a bit more for me?"
        ]
      }
      const options = shortResponses[stepNum] || ["Tell me more!"]
      return options[Math.floor(Math.random() * options.length)]
    }

    // Handle very long responses
    if (isLong) {
      return "Wow, I love all this detail! There are going to be SO many opportunities for you."
    }

    // Standard follow-ups based on role selection - more enthusiastic!
    const followUps: Record<number, Record<string, string>> = {
      0: {
        "Speaker / Presenter": "YES! Speakers have incredible opportunities out there — stages, podcasts, panels. You're going to love what I find.",
        "Writer / Author": "Amazing! Writers can build such powerful audiences. I'm already thinking of opportunities for you.",
        "Artist / Creative": "So exciting! The creative space is FULL of grants, residencies, and collabs waiting for you.",
        "Founder / Builder": "Love it! Founders building in public have massive visibility opportunities. This is going to be good.",
        "Consultant / Expert": "Perfect! Positioning yourself as an expert opens so many doors. I can already see the possibilities.",
        "Musician / Performer": "This is great! Music has so many angles — festivals, podcasts, brand work. You're in the right place.",
        "default": "This is going to be exciting!"
      },
      1: {
        "All of the above": "I love the ambition! We're going to cast a wide net and find you some gems.",
        "Speaking gigs": "Speaking is HUGE for building credibility. I've got some great stages in mind.",
        "Podcast guest spots": "Podcasts are such a powerful way to reach new audiences. Perfect choice.",
        "Getting published": "Bylines can really establish you as the go-to expert. Great strategy.",
        "Brand partnerships": "Brand deals can be amazing for visibility AND income. Smart move.",
        "Grants & funding": "There's SO much grant money out there that people don't know about. I'll find it for you.",
        "default": "Great focus! This is going to be good."
      },
      2: {
        "default": "That's a powerful niche to own! I can already see some perfect fits."
      },
      3: {
        "default": "I love that vision! Let's make it happen."
      }
    }
    
    return followUps[stepNum]?.[answer] || followUps[stepNum]?.["default"] || "This is exciting!"
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
        setIsLoadingLineup(true)
        
        const loadingMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Perfect! Give me just a sec — I'm finding your first 5 opportunities right now..."
        }
        setMessages(prev => [...prev, loadingMessage])
        
        // Submit to API and get lineup
        try {
          const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: content.trim(),
              role: userData.role || "",
              visibility: userData.visibility || "",
              topics: userData.topics || "",
              goals: userData.goals || ""
            })
          })
          
          const data = await res.json()
          setIsTyping(false)
          setIsLoadingLineup(false)
          
          if (data.success && data.opportunities) {
            setLineup(data.opportunities)
            
            const successMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: `HERE WE GO! I found 5 amazing opportunities just for you. Check them out below — and I've already sent them to your inbox too!\n\nYour first 4 weeks are free. After that it's $9/month to keep these personalized opportunities coming every Monday.`
            }
            setMessages(prev => [...prev, successMessage])
          } else {
            const successMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: data.error || `You're in! Your first opportunities are on the way to your inbox.\n\nFirst 4 weeks are free. After that it's $9/month to keep them coming.`
            }
            setMessages(prev => [...prev, successMessage])
          }
          
          setShowPayment(true)
        } catch {
          setIsTyping(false)
          setIsLoadingLineup(false)
          
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Hmm, something went sideways. Try that email again?"
          }
          setMessages(prev => [...prev, errorMessage])
        }
        
        return
      } else {
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 800))
        setIsTyping(false)
        
        const retryMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "That doesn't look quite right — I need a valid email to send you the goods!"
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

          {/* Loading Lineup Indicator */}
          {isLoadingLineup && (
            <div className="mt-6 p-6 rounded-2xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-white">Finding your perfect opportunities...</p>
              </div>
            </div>
          )}

          {/* Lineup Display */}
          {lineup.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your First Lineup</h3>
                  <p className="text-sm text-muted-foreground">5 opportunities picked just for you</p>
                </div>
              </div>
              
              {lineup.map((opp, idx) => (
                <a
                  key={idx}
                  href={opp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 rounded-2xl bg-secondary/80 border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shrink-0 text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{opp.type}</span>
                        {opp.deadline && (
                          <span className="text-xs text-muted-foreground">Deadline: {opp.deadline}</span>
                        )}
                      </div>
                      <h4 className="text-white font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {opp.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2 italic line-clamp-2">
                        "{opp.reason}"
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                        <span>View opportunity</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
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
