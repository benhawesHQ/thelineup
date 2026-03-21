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
  inputType?: "text" | "email" | "name" // For showing form inputs instead of chat
  inputLabel?: string
  inputPlaceholder?: string
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hey! So glad you're here. I'm going to ask you a few quick questions so I can find opportunities that are actually perfect for YOU.",
  inputType: "name",
  inputLabel: "First name",
  inputPlaceholder: "Enter your first name"
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
  const [userName, setUserName] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [pendingEmail, setPendingEmail] = useState("")
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false)
  const [showLineupOnly, setShowLineupOnly] = useState(false)
  const [formInputValue, setFormInputValue] = useState("")
  const [currentInputType, setCurrentInputType] = useState<"name" | "email" | "text" | null>("name")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  

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

  // Step 0: Name (initial message asks this)
  // Step 1: Role selection (multi-select)
  // Step 2: Visibility
  // Step 3: Topics  
  // Step 4: Goals
  // Step 5: Email
  // Step 6: Email confirmation
  
  const ROLE_OPTIONS = ["Speaker / Presenter", "Writer / Author", "Artist / Creative", "Founder / Builder", "Consultant / Expert", "Musician / Performer", "Athlete", "Coach / Trainer"]
  
  const conversationFlow = [
    {
      question: "What do you do? Check all that apply — then hit 'Continue' when you're done!",
      options: ROLE_OPTIONS,
      multiSelect: true
    },
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
      question: "I've got some amazing stuff lined up for you already!",
      options: [],
      inputType: "email" as const,
      inputLabel: "Email address",
      inputPlaceholder: "you@example.com"
    }
  ]

  const getSmartResponse = (answer: string, stepNum: number): string => {
    const wordCount = answer.trim().split(/\s+/).length
    const isShort = wordCount < 4
    const isLong = wordCount > 30

    // Handle very short responses
    if (isShort && stepNum !== 5) {
      const shortResponses: Record<number, string[]> = {
        1: [
          "Great combination!",
          "Love that mix!",
          "Perfect, I can work with that!"
        ],
        2: [
          "Great choice! Why is that the priority right now?",
          "Smart! What's driving that focus?"
        ],
        3: [
          "Ooh interesting! Tell me more about your specific angle?",
          "That's cool! Can you give me a concrete example?"
        ],
        4: [
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

    // Standard follow-ups based on step - more enthusiastic!
    const followUps: Record<number, Record<string, string>> = {
      1: {
        "default": "Awesome combination! I can already see some great opportunities for you."
      },
      2: {
        "All of the above": "I love the ambition! We're going to cast a wide net and find you some gems.",
        "Speaking gigs": "Speaking is HUGE for building credibility. I've got some great stages in mind.",
        "Podcast guest spots": "Podcasts are such a powerful way to reach new audiences. Perfect choice.",
        "Getting published": "Bylines can really establish you as the go-to expert. Great strategy.",
        "Brand partnerships": "Brand deals can be amazing for visibility AND income. Smart move.",
        "Grants & funding": "There's SO much grant money out there that people don't know about. I'll find it for you.",
        "default": "Great focus! This is going to be good."
      },
      3: {
        "default": "That's a powerful niche to own! I can already see some perfect fits."
      },
      4: {
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

    // Handle email confirmation step
    if (awaitingEmailConfirm) {
      const answer = content.trim().toLowerCase()
      if (answer === "yes" || answer === "y" || answer === "yep" || answer === "yeah" || answer === "correct" || answer === "that's right" || answer.includes("yes")) {
        // Confirmed! Process signup
        setEmail(pendingEmail)
        setAwaitingEmailConfirm(false)
        setCurrentInputType(null)
        setIsTyping(true)
        setIsLoadingLineup(true)
        
        const loadingMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Amazing, ${userName}! Give me just a sec — I'm finding your first 5 opportunities right now...`
        }
        setMessages(prev => [...prev, loadingMessage])
        
        // Submit to API and get lineup
        try {
          const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: pendingEmail,
              name: userName,
              role: selectedRoles.join(", ") || userData.role || "",
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
            setShowLineupOnly(true) // Hide chat, show only lineup
            setShowPayment(true)
          } else {
            const errorMsg: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: data.error || "Something went wrong. Try again?"
            }
            setMessages(prev => [...prev, errorMsg])
          }
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
        // They said no, ask for email again
        setAwaitingEmailConfirm(false)
        setPendingEmail("")
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 600))
        setIsTyping(false)
        
        const retryMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "No problem! What's the correct email?"
        }
        setMessages(prev => [...prev, retryMessage])
        return
      }
    }

    // Step 0: Name (comes from form input)
    if (step === 0) {
      const name = content.trim()
      setUserName(name)
      setUserData(prev => ({ ...prev, name }))
      setCurrentInputType(null) // Clear form input
      setFormInputValue("")
      
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 800))
      setIsTyping(false)
      
      const nextQuestion = conversationFlow[0]
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Great to meet you, ${name}! ${nextQuestion.question}`,
        options: nextQuestion.options
      }
      setMessages(prev => [...prev, assistantMessage])
      setStep(1)
      return
    }
    
    // Store user data for non-name steps
    const stepKeys = ["", "role", "visibility", "topics", "goals", "email"]
    setUserData(prev => ({ ...prev, [stepKeys[step]]: content.trim() }))

    // Check if this is the email step (step 5) - now uses form input
    if (step === 5) {
      const emailValue = content.trim()
      if (emailValue.includes("@") && emailValue.includes(".")) {
        // Valid email from form - confirm it
        setPendingEmail(emailValue)
        setAwaitingEmailConfirm(true)
        setCurrentInputType(null)
        setFormInputValue("")
        
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 600))
        setIsTyping(false)
        
        const confirmMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Got it — I have ${emailValue}. Is that correct? (Type "yes" or "no")`
        }
        setMessages(prev => [...prev, confirmMessage])
        return
      } else {
        // Invalid email
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 400))
        setIsTyping(false)
        
        const retryMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Hmm, that doesn't look like a valid email. Try again?",
          inputType: "email",
          inputLabel: "Email address",
          inputPlaceholder: "you@example.com"
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
    
    // Check if we need to probe more (short answer) - skip for multi-select role step
    const wordCount = content.trim().split(/\s+/).length
    const needsMoreInfo = wordCount < 4 && step !== 5 && step !== 1
    
    if (needsMoreInfo && Math.random() > 0.3) {
      // Sometimes ask for more detail
      setIsTyping(false)
      const probeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: smartResponse
      }
      setMessages(prev => [...prev, probeMessage])
      return
    }

    setIsTyping(false)

    // Get next question (adjust for new step numbering)
    const nextFlowIndex = step // step 1 -> conversationFlow[1], etc.
    const nextQuestion = conversationFlow[nextFlowIndex]

    if (nextQuestion) {
      const responseContent = `${smartResponse} ${nextQuestion.question}`

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: responseContent,
        options: nextQuestion.options,
        inputType: nextQuestion.inputType as "email" | "text" | "name" | undefined,
        inputLabel: nextQuestion.inputLabel,
        inputPlaceholder: nextQuestion.inputPlaceholder
      }
      setMessages(prev => [...prev, assistantMessage])
      setStep(step + 1)
      
      // Set current input type if this question has a form input
      if (nextQuestion.inputType) {
        setCurrentInputType(nextQuestion.inputType as "email" | "text" | "name")
      }
    }
  }

  const handleOptionClick = (option: string) => {
    // Check if this is a multi-select step (role selection at step 1)
    if (step === 1) {
      // Toggle selection
      setSelectedRoles(prev => {
        if (prev.includes(option)) {
          return prev.filter(r => r !== option)
        } else {
          return [...prev, option]
        }
      })
    } else {
      handleSendMessage(option)
    }
  }
  
  const handleContinueRoles = () => {
    if (selectedRoles.length > 0) {
      const rolesText = selectedRoles.join(", ")
      handleSendMessage(rolesText)
      setSelectedRoles([]) // Reset for next time
    }
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
          {/* Chat messages - hidden when showing lineup only */}
          {!showLineupOnly && messages.map((message) => (
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
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {message.options.map((option, idx) => {
                          const isSelected = step === 1 && selectedRoles.includes(option)
                          return (
                            <button
                              key={idx}
                              onClick={() => handleOptionClick(option)}
                              className={`px-4 py-2 text-sm rounded-full border transition-all cursor-pointer active:scale-95 ${
                                isSelected 
                                  ? "bg-primary text-primary-foreground border-primary" 
                                  : "border-primary/40 text-primary hover:bg-primary/10 hover:border-primary"
                              }`}
                            >
                              {isSelected && <span className="mr-1">✓</span>}
                              {option}
                            </button>
                          )
                        })}
                      </div>
                      {/* Continue button for multi-select */}
                      {step === 1 && selectedRoles.length > 0 && (
                        <Button
                          onClick={handleContinueRoles}
                          className="mt-4 gradient-brand text-white font-semibold cursor-pointer"
                        >
                          Continue with {selectedRoles.length} selected
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Form Input Box */}
                  {message.inputType && (
                    <div className="mt-4 bg-secondary/50 rounded-2xl p-4 border border-border">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {message.inputLabel}
                      </label>
                      <div className="flex gap-3">
                        <input
                          type={message.inputType === "email" ? "email" : "text"}
                          value={formInputValue}
                          onChange={(e) => setFormInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && formInputValue.trim()) {
                              handleSendMessage(formInputValue)
                            }
                          }}
                          placeholder={message.inputPlaceholder}
                          className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-base"
                          style={{ fontSize: "16px" }}
                          autoFocus
                        />
                        <Button
                          onClick={() => {
                            if (formInputValue.trim()) {
                              handleSendMessage(formInputValue)
                            }
                          }}
                          disabled={!formInputValue.trim()}
                          className="gradient-brand text-white cursor-pointer px-6"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && !showLineupOnly && (
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
              {showLineupOnly && (
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Here you go, {userName}!
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your first 5 opportunities are ready. I've also sent them to your inbox at {email}.
                  </p>
                </div>
              )}
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

      {/* Fixed Input - hidden when showing lineup */}
      {/* Bottom input bar - hidden when showing lineup or using form inputs */}
      {!showLineupOnly && !currentInputType && (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-safe">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={awaitingEmailConfirm ? "Type yes or no..." : "Type your answer..."}
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
      )}
    </div>
  )
}
