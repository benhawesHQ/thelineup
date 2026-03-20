"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./chatbot.module.css"

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
    <div className={`${styles.chatbotWidget} ${isOpen ? styles.open : ""} ${teaserHidden ? styles.teaserHidden : ""}`}>
      {!teaserHidden && (
        <div className={styles.chatbotTeaser} onClick={openChatbot}>
          <div className={styles.chatbotTeaserText}>
            Ready to get your first <strong>Lineup</strong>?
          </div>
          <div className={styles.chatbotTeaserSub}>Chat with me to get started</div>
        </div>
      )}

      <div className={styles.chatbotWindow}>
        <div className={styles.chatbotHeader}>
          <div className={styles.chatbotAvatar}>BH</div>
          <div className={styles.chatbotHeaderInfo}>
            <h4>Ben from The Lineup</h4>
            <span>Usually replies instantly</span>
          </div>
          <div className={styles.chatbotHeaderStatus} />
        </div>

        <div className={styles.chatbotMessages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.chatMsg} ${msg.type === "bot" ? styles.bot : styles.user}`}>
              <div className={styles.chatMsgAvatar}>{msg.type === "bot" ? "BH" : chatData.name ? chatData.name[0].toUpperCase() : "Y"}</div>
              <div className={styles.chatMsgContent}>
                <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                {msg.hint && <span className={styles.hint}>{msg.hint}</span>}
                {msg.chips && (
                  <div className={styles.chatChips}>
                    {msg.chips.map((chip) => (
                      <button key={chip} className={`${styles.chatChip} ${selectedChips.includes(chip) ? styles.selected : ""}`} onClick={() => toggleChatChip(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.chatMsg} ${styles.bot}`}>
              <div className={styles.chatMsgAvatar}>BH</div>
              <div className={styles.chatMsgContent}>
                <div className={styles.chatTyping}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
          {showPreviewButton && (
            <div className={`${styles.chatMsg} ${styles.bot}`}>
              <div className={styles.chatMsgAvatar}>BH</div>
              <div className={styles.chatMsgContent}>
                <button className={styles.previewButton} onClick={handlePreview}>
                  Show Me My Preview Lineup
                </button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatProgress}>
          <div className={styles.chatProgressBar}>
            <div className={styles.chatProgressFill} style={{ width: `${updateProgress()}%` }} />
          </div>
          <div className={styles.chatProgressText}>{getProgressText()}</div>
        </div>

        <div className={styles.chatbotInputArea}>
          <input
            type="text"
            className={styles.chatbotInput}
            placeholder={awaitingChips ? "Select options above, then click send" : "Type your answer..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage()
            }}
            disabled={isComplete}
          />
          <button className={styles.chatbotSend} onClick={sendMessage} disabled={isComplete}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <button className={styles.chatbotToggle} onClick={toggleChatbot} aria-label="Chat with us">
        <svg className={styles.chatIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg className={styles.closeIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
