"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, ExternalLink, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Opportunity {
  title: string
  link: string
  type: string
  deadline?: string
  reason: string
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
    id: "name",
    type: "text",
    question: "First, what's your name?",
    subtitle: "We'll use this to personalize your opportunities",
    placeholder: "Your first name",
    required: true
  },
  {
    id: "roles",
    type: "multiselect",
    question: "What do you do?",
    subtitle: "Select all that apply",
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
    type: "select",
    question: "What kind of visibility matters most?",
    subtitle: "Pick the one that would move the needle for you",
    options: [
      "Speaking gigs",
      "Podcast guest spots",
      "Getting published",
      "Brand partnerships",
      "Grants & funding",
      "All of the above"
    ],
    required: true
  },
  {
    id: "topics",
    type: "textarea",
    question: "What topics are you known for?",
    subtitle: "Or want to be known for",
    placeholder: "AI, leadership, sustainability, comedy, fitness...",
    required: true
  },
  {
    id: "goals",
    type: "textarea",
    question: "What's your big picture goal?",
    subtitle: "Where do you want this to take you?",
    placeholder: "Land a TEDx talk, get published in Forbes, build my speaking business...",
    required: true
  },
  {
    id: "email",
    type: "email",
    question: "Where should we send your opportunities?",
    subtitle: "We'll send your first 5 opportunities right away",
    placeholder: "you@example.com",
    required: true
  },
  {
    id: "confirm",
    type: "confirm",
    question: "Is this email correct?",
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
  const [pendingEmail, setPendingEmail] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    // Handle email step - store email and move to confirmation
    if (step.type === "email") {
      setPendingEmail(inputValue.trim())
      setCurrentStep(prev => prev + 1)
      return
    }

    // Handle email confirmation - submit everything
    if (step.type === "confirm") {
      setIsLoading(true)
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: answers.name,
            email: pendingEmail,
            role: Array.isArray(answers.roles) ? answers.roles.join(", ") : "",
            visibility: answers.visibility || "",
            topics: answers.topics || "",
            goals: answers.goals || ""
          })
        })
        const data = await res.json()
        if (data.success) {
          setAnswers(prev => ({ ...prev, email: pendingEmail }))
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
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-white">Your First 5 Opportunities</h2>
                </div>
                
                {lineup.map((opp, idx) => (
                  <motion.a
                    key={idx}
                    href={opp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="block p-6 rounded-2xl bg-secondary/80 border border-border hover:border-primary/50 transition-all group"
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
                        <h3 className="text-white font-semibold text-lg group-hover:text-primary transition-colors">
                          {opp.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{opp.reason}"
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                          <span>View opportunity</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
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

      {/* Header */}
      <header className="fixed top-1 left-0 right-0 z-40 px-4 py-4">
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

                {/* Textarea input - larger, expandable */}
                {step.type === "textarea" && (
                  <div className="space-y-4">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        // Auto-resize
                        e.target.style.height = "auto"
                        e.target.style.height = e.target.scrollHeight + "px"
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleNext()
                        }
                      }}
                      placeholder={step.placeholder}
                      rows={3}
                      className="w-full text-xl md:text-2xl bg-secondary/50 border-2 border-border focus:border-primary rounded-2xl outline-none p-5 text-white placeholder:text-muted-foreground/50 transition-colors resize-none min-h-[140px]"
                      style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)" }}
                    />
                    <p className="text-sm text-muted-foreground">Press Enter to continue, Shift+Enter for new line</p>
                  </div>
                )}

                {/* Email confirmation */}
                {step.type === "confirm" && (
                  <div className="space-y-6">
                    <div className="p-6 md:p-8 rounded-2xl bg-secondary/50 border-2 border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-6 h-6 text-primary" />
                        <span className="text-muted-foreground">Your email</span>
                      </div>
                      <p className="text-2xl md:text-3xl font-medium text-white break-all">
                        {pendingEmail}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(prev => prev - 1)
                          setInputValue(pendingEmail)
                        }}
                        className="flex-1 h-14 text-lg border-2 cursor-pointer"
                      >
                        Edit email
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={isLoading}
                        className="flex-1 h-14 text-lg gradient-brand text-white cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Finding opportunities...
                          </>
                        ) : (
                          <>
                            Yes, show me my lineup!
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
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
