"use client"

import { useState, useRef, useEffect } from "react"

interface UserData {
  name: string
  email: string
  location: string
  interests: string[]
  topics: string[]
  goal: string
  blocker: string
  extra: string
}

interface ChatMessage {
  type: "bot" | "user"
  content: string
  chips?: string[]
  hint?: string
}

interface ChatbotProps {
  onComplete: (data: UserData) => void
}

interface ChatStep {
  key: string
  bot: string | ((d: UserData) => string)
  followUp?: string
  field?: keyof UserData
  validate?: (v: string) => boolean
  nudge?: string
  hint?: string
  chips?: string[]
  multiSelect?: boolean
  optional?: boolean
  pushForMore?: (v: string) => string | null
  final?: boolean
}

const chatFlow: ChatStep[] = [
  {
    key: "intro",
    bot: "Hey! I'm Ben. I built The Lineup to help people like you find opportunities you'd never find on your own. Speaking gigs, podcast spots, writing opportunities — all matched to *you*.",
    followUp: "Let's build your first Lineup together. What's your first name?",
    field: "name",
    validate: (v) => v.length >= 1,
    nudge: "I'd love to know what to call you! Just your first name is perfect.",
  },
  {
    key: "email",
    bot: (d) => `Great to meet you, ${d.name}! Where should I send your Lineup each Monday?`,
    field: "email",
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    nudge: "That doesn't look like a valid email. Can you double-check?",
  },
  {
    key: "location",
    bot: "Perfect. Where are you based? This helps me find local events and opportunities near you.",
    hint: "City, State or just 'Remote' works",
    field: "location",
    validate: () => true,
    optional: true,
  },
  {
    key: "interests",
    bot: "Now for the fun part. What kinds of opportunities are you most interested in?",
    hint: "Pick as many as you want — the more I know, the better your Lineup",
    chips: ["Speaking", "Podcasting", "Writing", "Content Creation", "Events & Networking", "Comedy", "Startups", "Journalism", "Film & Video", "Music", "Design", "Tech"],
    field: "interests",
    multiSelect: true,
    nudge: "Pick at least one so I know what to look for!",
  },
  {
    key: "topics",
    bot: (d) => `Love it — ${d.interests.slice(0, 2).join(" and ")}${d.interests.length > 2 ? " and more" : ""}. Now, what topics do you want to be known for?`,
    hint: "These help me match you with the right audiences",
    chips: ["AI & Technology", "Marketing", "Culture & Society", "Sustainability", "Health & Wellness", "Finance & Business", "Education", "Social Justice", "Science", "Food & Hospitality", "Sports", "History & Politics"],
    field: "topics",
    multiSelect: true,
    nudge: "Select at least one topic that you're passionate about!",
  },
  {
    key: "goal",
    bot: (d) => `Nice choices. Here's the big one, ${d.name}: What's your main goal right now? What are you trying to make happen?`,
    hint: "Be specific! 'Land my first TEDx' is better than 'speak more'",
    field: "goal",
    validate: (v) => v.length >= 10,
    nudge: "I need a bit more here — the more specific you are about your goal, the better I can match opportunities to you. What does success look like?",
    pushForMore: (v) => (v.length < 30 ? "That's a good start! Can you tell me more? What specifically would a win look like? The more detail, the better your Lineup." : null),
  },
  {
    key: "blocker",
    bot: "I hear you. What's been getting in the way? What's stopped you from making progress on this?",
    hint: "No wrong answers — just helps me understand where to focus",
    field: "blocker",
    validate: (v) => v.length >= 5,
    nudge: "Even a short answer helps — what's the biggest thing holding you back?",
    pushForMore: (v) => (v.length < 25 ? "Got it. Anything else? The blockers help me avoid sending you stuff that won't work for your situation." : null),
  },
  {
    key: "extra",
    bot: (d) => `This is super helpful, ${d.name}. One last thing — anything else I should know? Your background, what you've tried, what you're sick of seeing, what makes you *you*?`,
    hint: "Optional but makes your Lineup way more personal",
    field: "extra",
    validate: () => true,
    optional: true,
    pushForMore: (v) => (v.length > 0 && v.length < 20 ? "Love that you're sharing! Feel free to add more — this is what makes your Lineup feel like it was made just for you." : null),
  },
  {
    key: "complete",
    bot: (d) => `Perfect, ${d.name}! I've got everything I need. Your first Lineup drops Monday at 8am — 5 opportunities matched specifically to your goals in ${d.topics[0] || "your space"}. Get ready.`,
    final: true,
  },
]

export function Chatbot({ onComplete }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [teaserHidden, setTeaserHidden] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatStep, setChatStep] = useState(0)
  const [chatData, setChatData] = useState<UserData>({
    name: "",
    email: "",
    location: "",
    interests: [],
    topics: [],
    goal: "",
    blocker: "",
    extra: "",
  })
  const [inputValue, setInputValue] = useState("")
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [awaitingChips, setAwaitingChips] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showPreviewButton, setShowPreviewButton] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const addBotMessage = (text: string, hint?: string, chips?: string[]) => {
    setIsTyping(true)
    setTimeout(
      () => {
        setIsTyping(false)
        const msgText = typeof text === "function" ? text(chatData) : text
        const content = msgText.replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        setMessages((prev) => [...prev, { type: "bot", content, hint, chips }])
        if (chips) {
          setAwaitingChips(true)
          setSelectedChips([])
        }
      },
      800 + Math.random() * 400
    )
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { type: "user", content: text }])
  }

  const startChatFlow = () => {
    const step = chatFlow[0]
    const botText = typeof step.bot === "function" ? step.bot(chatData) : step.bot
    addBotMessage(botText)
    setTimeout(() => {
      if (step.followUp) {
        addBotMessage(step.followUp, step.hint, step.chips)
      }
    }, 1200)
  }

  const openChatbot = () => {
    setIsOpen(true)
    setTeaserHidden(true)
    if (chatStep === 0 && messages.length === 0) {
      startChatFlow()
    }
  }

  const toggleChatbot = () => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      openChatbot()
    }
  }

  const toggleChatChip = (value: string) => {
    setSelectedChips((prev) => {
      if (prev.includes(value)) {
        return prev.filter((c) => c !== value)
      }
      return [...prev, value]
    })
  }

  const updateProgress = () => {
    return Math.min((chatStep / (chatFlow.length - 1)) * 100, 100)
  }

  const getProgressText = () => {
    const texts = ["Let's get started", "Getting to know you...", "Almost there...", "Looking good!", "Final touches...", "Just one more...", "Wrapping up...", "All done!"]
    return texts[Math.min(chatStep, texts.length - 1)]
  }

  const sendMessage = () => {
    const step = chatFlow[chatStep]
    let value: string | string[]

    if (awaitingChips) {
      if (selectedChips.length === 0 && step.nudge) {
        addBotMessage(step.nudge)
        return
      }
      value = selectedChips
      addUserMessage(selectedChips.join(", "))
      setAwaitingChips(false)
    } else {
      value = inputValue.trim()
      if (!value && !step.optional) {
        if (step.nudge) addBotMessage(step.nudge)
        return
      }
      if (value && step.validate && !step.validate(value)) {
        if (step.nudge) addBotMessage(step.nudge)
        return
      }
      if (value) addUserMessage(value)
    }

    setInputValue("")

    // Store the value
    if (step.field) {
      setChatData((prev) => ({
        ...prev,
        [step.field as keyof UserData]: value,
      }))
    }

    // Check if we should push for more detail
    if (step.pushForMore && value) {
      const pushMsg = step.pushForMore(Array.isArray(value) ? value.join(" ") : value)
      if (pushMsg) {
        setTimeout(() => addBotMessage(pushMsg), 600)
        return
      }
    }

    // Move to next step
    const nextStep = chatStep + 1
    setChatStep(nextStep)

    if (nextStep < chatFlow.length) {
      const next = chatFlow[nextStep]
      setTimeout(() => {
        const botText = typeof next.bot === "function" ? next.bot({ ...chatData, [step.field as keyof UserData]: value }) : next.bot
        addBotMessage(botText, next.hint, next.chips)

        if (next.final) {
          setIsComplete(true)
          setTimeout(() => {
            addBotMessage("Want to see a preview of what your Lineup will look like? I can generate a sample right now.")
            setTimeout(() => {
              setShowPreviewButton(true)
            }, 1200)
          }, 2000)
        }
      }, 600)
    }
  }

  const handlePreview = () => {
    setIsOpen(false)
    onComplete(chatData)
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 ${isOpen ? "" : ""}`}>
      {/* Teaser Bubble */}
      {!teaserHidden && (
        <div 
          onClick={openChatbot}
          className="bg-white border border-[var(--border)] rounded-2xl rounded-br-sm p-4 shadow-xl max-w-[260px] cursor-pointer hover:-translate-y-0.5 hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="text-sm font-medium text-foreground">
            Ready to get your first <strong className="text-orange">Lineup</strong>?
          </div>
          <div className="text-xs text-muted mt-1">Chat with me to get started</div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[560px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-black p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange to-pink flex items-center justify-center font-serif font-bold text-white text-sm">BH</div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm">Ben from The Lineup</h4>
              <span className="text-white/50 text-xs">Usually replies instantly</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-off-white">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${msg.type === "user" ? "self-end flex-row-reverse ml-auto" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs shrink-0 ${msg.type === "bot" ? "bg-gradient-to-r from-orange to-pink text-white" : "bg-black text-white"}`}>
                  {msg.type === "bot" ? "BH" : chatData.name ? chatData.name[0].toUpperCase() : "Y"}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.type === "bot" ? "bg-white border border-[var(--border)] rounded-bl-sm" : "bg-black text-white rounded-br-sm"}`}>
                  <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                  {msg.hint && <span className="block mt-2 text-xs text-muted italic">{msg.hint}</span>}
                  {msg.chips && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {msg.chips.map((chip) => (
                        <button 
                          key={chip} 
                          onClick={() => toggleChatChip(chip)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            selectedChips.includes(chip) 
                              ? "border-orange bg-orange/10 text-orange" 
                              : "border-[var(--border)] bg-white text-muted hover:border-orange/50"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[92%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange to-pink flex items-center justify-center font-serif font-bold text-xs text-white shrink-0">BH</div>
                <div className="bg-white border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Preview Button */}
            {showPreviewButton && (
              <div className="flex gap-2.5 max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange to-pink flex items-center justify-center font-serif font-bold text-xs text-white shrink-0">BH</div>
                <div className="bg-white border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
                  <button 
                    onClick={handlePreview}
                    className="bg-gradient-to-r from-orange via-pink to-purple text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                  >
                    Show Me My Preview Lineup
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Progress */}
          <div className="px-5 pb-3 bg-white">
            <div className="h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange to-pink transition-all duration-500" 
                style={{ width: `${updateProgress()}%` }} 
              />
            </div>
            <div className="text-xs text-muted text-center mt-1.5">{getProgressText()}</div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-[var(--border)] flex gap-2.5">
            <input
              type="text"
              placeholder={awaitingChips ? "Select options above, then click send" : "Type your answer..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage() }}
              disabled={isComplete}
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-full text-sm focus:outline-none focus:border-orange disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={sendMessage}
              disabled={isComplete}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-orange to-pink flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleChatbot}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-orange via-pink to-purple flex items-center justify-center shadow-xl shadow-orange/40 hover:scale-110 transition-transform"
        aria-label="Chat with us"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  )
}
