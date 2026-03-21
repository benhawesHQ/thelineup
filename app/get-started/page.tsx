"use client"

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

import { useState, useEffect, useRef } from "react"
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, ExternalLink, Mail, Mic, MicOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Opportunity {
  title: string
  link: string
  type: string
  category: string
  deadline?: string
  description: string
  reason: string
  action: string
  venue?: string
  date?: string
}

interface QuizStep {
  id: string
  type: "text" | "textarea" | "email" | "select" | "multiselect" | "confirm"
  question: string
  subtitle?: string
  placeholder?: string
  options?: string[]
  required?: boolean
}

const QUIZ_STEPS: QuizStep[] = [
  {
    id: "email",
    type: "email",
    question: "Let's start with your email",
    subtitle: "So we can send you your personalized opportunities",
    placeholder: "you@example.com",
    required: true
  },
  {
    id: "name",
    type: "text",
    question: "What's your name?",
    subtitle: "We'll use this to personalize your lineup",
    placeholder: "Your first name",
    required: true
  },
  {
    id: "roles",
    type: "multiselect",
    question: "What do you do?",
    subtitle: "Select all that apply — we love multi-hyphenates!",
    options: [
      "Speaker / Presenter",
      "Writer / Author", 
      "Artist / Creative",
      "Founder / Builder",
      "Consultant / Expert",
      "Musician / Performer",
      "Athlete",
      "Coach / Trainer"
    ],
    required: true
  },
  {
    id: "visibility",
    type: "multiselect",
    question: "What kind of visibility are you looking for?",
    subtitle: "Select all that apply - most people pick a few!",
    options: [
      "Speaking gigs",
      "Podcast guest spots",
      "Getting published",
      "Brand partnerships",
      "Grants & funding"
    ],
    required: true
  },
  {
    id: "topics",
    type: "textarea",
    question: "Tell me about your expertise",
    subtitle: "What do you want to be known for? Be specific — mention your business, niche, or unique angle.",
    placeholder: "I run a Photo Booth business and speak about event entrepreneurship. I'm also passionate about helping creatives monetize their skills and land corporate clients...",
    required: true
  },
  {
    id: "goals",
    type: "textarea",
    question: "What are you working toward?",
    subtitle: "Be specific! Mention dream stages, publications, or milestones.",
    placeholder: "I want to land a TEDx talk on creative entrepreneurship, get featured in Entrepreneur Magazine, and become a go-to speaker for corporate events in the events industry...",
    required: true
  },
  {
    id: "city",
    type: "text",
    question: "What city are you based in?",
    subtitle: "So we can find opportunities near you",
    placeholder: "New York, Los Angeles, London...",
    required: true
  },
  {
    id: "travel",
    type: "select",
    question: "Are you open to traveling for opportunities?",
    subtitle: "This helps us know what to send you",
    options: [
      "Yes, I'll travel anywhere",
      "Within my country only",
      "Online or local only"
    ],
    required: true
  },
  {
    id: "confirm",
    type: "confirm",
    question: "Ready to see your opportunities?",
    subtitle: "",
    required: true
  }
]

export default function GetStartedPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [inputValue, setInputValue] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [lineup, setLineup] = useState<Opportunity[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const MAX_RECORDING_TIME = 300 // 5 minutes in seconds
  const STORAGE_KEY = "thelineup_quiz_progress"

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { step, answers: savedAnswers } = JSON.parse(saved)
        if (savedAnswers && Object.keys(savedAnswers).length > 0) {
          setAnswers(savedAnswers)
          setCurrentStep(step || 0)
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save progress whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          step: currentStep,
          answers
        }))
        setHasUnsavedChanges(true)
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [answers, currentStep])

  // Warn before closing tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isComplete) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, isComplete])

  // Clear storage on completion
  const clearSavedProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setHasUnsavedChanges(false)
    } catch {
      // Ignore
    }
  }

  const step = QUIZ_STEPS[currentStep]
  const progress = ((currentStep) / (QUIZ_STEPS.length - 1)) * 100
  const isLastStep = currentStep === QUIZ_STEPS.length - 1

  // Focus input when step changes
  useEffect(() => {
    if (step?.type === "text" || step?.type === "email") {
      setTimeout(() => inputRef.current?.focus(), 300)
    } else if (step?.type === "textarea") {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [currentStep, step?.type])

  // Reset input when step changes
  useEffect(() => {
    setInputValue("")
    setSelectedOptions([])
    setError("")
  }, [currentStep])

  const handleNext = async () => {
    setError("")

    // Validate current step
    if (step.required) {
      if (step.type === "text" || step.type === "email" || step.type === "textarea") {
        if (!inputValue.trim()) {
          setError("This field is required")
          return
        }
        if (step.type === "email" && (!inputValue.includes("@") || !inputValue.includes("."))) {
          setError("Please enter a valid email address")
          return
        }
      }
      if (step.type === "multiselect" && selectedOptions.length === 0) {
        setError("Please select at least one option")
        return
      }
    }

    // Save answer
    if (step.type === "text" || step.type === "email" || step.type === "textarea") {
      setAnswers(prev => ({ ...prev, [step.id]: inputValue.trim() }))
    } else if (step.type === "multiselect") {
      setAnswers(prev => ({ ...prev, [step.id]: selectedOptions }))
    } else if (step.type === "select") {
      // Already saved on click
    }

    // Handle email step - save and continue
    if (step.type === "email") {
      setAnswers(prev => ({ ...prev, email: inputValue.trim() }))
      setCurrentStep(prev => prev + 1)
      return
    }

    // Handle confirmation - submit everything
    if (step.type === "confirm") {
      setIsLoading(true)
      const email = answers.email as string
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: answers.name,
            email,
            role: Array.isArray(answers.roles) ? answers.roles.join(", ") : "",
            visibility: Array.isArray(answers.visibility) ? answers.visibility.join(", ") : (answers.visibility || ""),
            topics: answers.topics || "",
            goals: answers.goals || "",
            city: answers.city || "",
            travel: answers.travel || ""
          })
        })
        const data = await res.json()
        if (data.success) {
          clearSavedProgress()
          setLineup(data.opportunities || [])
          setIsComplete(true)
          setShowPayment(true)
        } else {
          setError(data.error || "Something went wrong")
        }
      } catch {
        setError("Something went wrong. Please try again.")
      }
      setIsLoading(false)
      return
    }

    // Move to next step
    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSelectOption = (option: string) => {
    if (step.type === "multiselect") {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      )
    } else {
      setAnswers(prev => ({ ...prev, [step.id]: option }))
      // Auto-advance for single select
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 300)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  // Voice recording with Web Speech API
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Voice input is not supported in your browser. Try Chrome or Safari.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    
    recognition.onresult = (event) => {
      let finalTranscript = inputValue
      let interimTranscript = ""
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      setInputValue(finalTranscript + interimTranscript)
    }
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      stopRecording()
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access and try again.")
      }
    }
    
    recognition.onend = () => {
      if (isRecording) {
        // Restart if still supposed to be recording (browser may stop it)
        try {
          recognition.start()
        } catch {
          stopRecording()
        }
      }
    }
    
    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording()
            return MAX_RECORDING_TIME
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error("Failed to start recording:", err)
      setError("Failed to start voice input. Please try again.")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    setIsRecording(false)
    setRecordingTime(0)
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  // Completed state - show lineup
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark size={32} />
              <span className="font-bold text-white">The Lineup</span>
            </Link>
          </div>
        </header>

        <main className="pt-24 pb-12 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                You're in, {answers.name as string}!
              </h1>
              <p className="text-xl text-muted-foreground">
                Here's your first lineup. We've also sent it to {answers.email as string}.
              </p>
            </motion.div>

            {/* Lineup */}
            {lineup.length > 0 && (
              <div className="space-y-4 mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-white">Your Lineup</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                {lineup.map((opp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl bg-[#FFFDF5] border-l-4 border-l-primary overflow-hidden"
                  >
                    <div className="p-5 md:p-6">
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold tracking-widest text-muted-foreground">
                          {String(idx + 1).padStart(2, '0')} — {opp.type?.toUpperCase() || 'OPPORTUNITY'}
                        </span>
                      </div>
                      
                      {/* Category tag */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-secondary text-foreground">
                          {opp.category || 'GENERAL'}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 leading-tight">
                        {opp.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                        {opp.description || opp.reason}
                      </p>
                      
                      {/* Footer row */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="text-sm">
                          {opp.deadline && (
                            <span className="text-foreground">
                              <span className="text-muted-foreground">Deadline:</span>{' '}
                              <span className="font-semibold">{opp.deadline}</span>
                            </span>
                          )}
                          {!opp.deadline && opp.date && (
                            <span className="text-foreground font-semibold">{opp.date}</span>
                          )}
                          {!opp.deadline && !opp.date && (
                            <span className="text-muted-foreground">Open</span>
                          )}
                        </div>
                        <a
                          href={opp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {opp.action || 'View'} <span className="text-lg">→</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Payment CTA */}
            {showPayment && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-center"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Keep the opportunities coming</h3>
                <p className="text-muted-foreground mb-6">Your first 4 weeks are free. Then $9/month.</p>
                <Button 
                  className="h-14 px-8 gradient-brand text-white font-semibold text-lg cursor-pointer"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/create-checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: answers.email })
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
                <p className="text-sm text-muted-foreground mt-4">Cancel anytime. Seriously.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary">
        <motion.div 
          className="h-full gradient-brand"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Warning banner - shows after email entered */}
      {answers.email && !isComplete && (
        <div className="fixed top-1 left-0 right-0 z-50 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>Don't close this tab — your progress is saved but we're building your lineup!</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`fixed ${answers.email && !isComplete ? 'top-10' : 'top-1'} left-0 right-0 z-40 px-4 py-4 transition-all`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <LogoMark size={28} />
          </Link>
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {QUIZ_STEPS.length}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Question */}
              <div className="space-y-3">
                <motion.h1 
                  className="text-3xl md:text-5xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {step.question}
                </motion.h1>
                {step.subtitle && (
                  <motion.p 
                    className="text-lg md:text-xl text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {step.subtitle}
                  </motion.p>
                )}
              </div>

              {/* Input area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Text/Email input */}
                {(step.type === "text" || step.type === "email") && (
                  <div className="space-y-4">
                    <input
                      ref={inputRef}
                      type={step.type === "email" ? "email" : "text"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={step.placeholder}
                      className="w-full text-2xl md:text-3xl bg-transparent border-b-2 border-border focus:border-primary outline-none py-4 text-white placeholder:text-muted-foreground/50 transition-colors"
                      style={{ fontSize: "clamp(1.25rem, 4vw, 1.875rem)" }}
                    />
                  </div>
                )}

                {/* Textarea input - larger, expandable with mic */}
                {step.type === "textarea" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value)
                          // Auto-resize
                          e.target.style.height = "auto"
                          e.target.style.height = Math.max(180, e.target.scrollHeight) + "px"
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleNext()
                          }
                        }}
                        placeholder={step.placeholder}
                        rows={4}
                        className="w-full text-xl md:text-2xl bg-secondary/50 border-2 border-border focus:border-primary rounded-2xl outline-none p-5 pb-16 text-white placeholder:text-muted-foreground/50 transition-colors resize-none min-h-[180px]"
                        style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)" }}
                      />
                      {/* Mic button */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={toggleRecording}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer ${
                            isRecording 
                              ? "bg-red-500 text-white animate-pulse" 
                              : "bg-primary/20 text-primary hover:bg-primary/30"
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="w-5 h-5" />
                              <span className="text-sm font-medium">Stop {formatTime(recordingTime)}</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-5 h-5" />
                              <span className="text-sm font-medium">Tap to speak</span>
                            </>
                          )}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {isRecording ? `${formatTime(MAX_RECORDING_TIME - recordingTime)} left` : "5 min max"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Speak naturally or type - press Enter to continue</p>
                  </div>
                )}

                {/* Confirmation - show summary */}
                {step.type === "confirm" && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="p-5 md:p-6 rounded-2xl bg-secondary/50 border border-border space-y-4">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-white font-medium">Sending opportunities to:</span>
                        <span className="text-primary font-semibold">{answers.email as string}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-white font-medium">Looking for:</span>
                        <span className="text-muted-foreground">
                          {Array.isArray(answers.visibility) ? answers.visibility.slice(0, 3).join(", ") : "opportunities"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-white font-medium">Based in:</span>
                        <span className="text-muted-foreground">{answers.city as string}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleNext}
                      disabled={isLoading}
                      className="w-full h-16 text-xl gradient-brand text-white cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Finding your opportunities...
                        </>
                      ) : (
                        <>
                          Show me my lineup!
                          <ArrowRight className="w-6 h-6 ml-3" />
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      We'll search for specific opportunities that match your profile
                    </p>
                  </div>
                )}

                {/* Single select options */}
                {step.type === "select" && step.options && (
                  <div className="grid gap-3">
                    {step.options.map((option, idx) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => handleSelectOption(option)}
                        className={`w-full p-5 md:p-6 text-left text-lg md:text-xl rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.98] ${
                          answers[step.id] === option
                            ? "border-primary bg-primary/10 text-white"
                            : "border-border hover:border-primary/50 text-white hover:bg-secondary/50"
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center shrink-0 text-sm font-medium">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {option}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Multi-select options */}
                {step.type === "multiselect" && step.options && (
                  <div className="grid gap-3">
                    {step.options.map((option, idx) => {
                      const isSelected = selectedOptions.includes(option)
                      return (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full p-5 md:p-6 text-left text-lg md:text-xl rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.98] ${
                            isSelected
                              ? "border-primary bg-primary/10 text-white"
                              : "border-border hover:border-primary/50 text-white hover:bg-secondary/50"
                          }`}
                        >
                          <span className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "border-primary bg-primary" : "border-current"
                            }`}>
                              {isSelected && <Check className="w-5 h-5 text-white" />}
                            </span>
                            {option}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 mt-4"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom navigation - hide on confirm step since it has its own buttons */}
      {step.type !== "confirm" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`h-14 px-6 text-lg cursor-pointer ${currentStep === 0 ? "invisible" : ""}`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            {/* Next/Submit button - hide on single select since it auto-advances */}
            {step.type !== "select" && (
              <Button
                onClick={handleNext}
                disabled={isLoading || (step.type === "multiselect" && selectedOptions.length === 0)}
                className="h-14 px-8 gradient-brand text-white font-semibold text-lg cursor-pointer min-w-[140px]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
