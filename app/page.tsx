"use client"

import { useState, useCallback } from "react"
import { Chatbot } from "@/components/chatbot"

type Page = "home" | "survey" | "result"

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

interface Opportunity {
  title: string
  type: string
  description: string
  fit: string
  cta: string
}

interface LineupResult {
  intro: string
  opportunities: Opportunity[]
  recommendation: string
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    location: "",
    interests: [],
    topics: [],
    goal: "",
    blocker: "",
    extra: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LineupResult | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadMessage, setLoadMessage] = useState("")

  const showHome = useCallback(() => {
    setCurrentPage("home")
    window.scrollTo(0, 0)
  }, [])

  const showSurvey = useCallback(() => {
    setCurrentPage("survey")
    setStep(1)
    window.scrollTo(0, 0)
  }, [])

  const showResult = useCallback(() => {
    setCurrentPage("result")
    setLoading(true)
    setLoadProgress(0)
    window.scrollTo(0, 0)
  }, [])

  const stepMeta = [
    ["Step 1 of 4", "Let's start with the basics.", "Quick setup — this takes about 2 minutes and helps us find the right stuff for you."],
    ["Step 2 of 4", "What's your world?", "Pick your interests and topics. The more honest you are, the better your Lineup."],
    ["Step 3 of 4", "What are you going for?", "Tell me what you're trying to do. Don't be shy — be specific."],
    ["Step 4 of 4", "Last one.", "Any extra context? This is where you tell me what makes you, you."],
  ]

  const toggleChip = (group: "interests" | "topics", value: string) => {
    setUserData((prev) => {
      const arr = prev[group]
      if (arr.includes(value)) {
        return { ...prev, [group]: arr.filter((v) => v !== value) }
      }
      return { ...prev, [group]: [...arr, value] }
    })
  }

  const goStep = (n: number) => {
    if (n === 2) {
      if (!userData.name || !userData.email) {
        alert("Please enter your name and email.")
        return
      }
    }
    setStep(n)
  }

  const fallback = (u: UserData): LineupResult => {
    const n = u.name || "there"
    return {
      intro: `Hey ${n} — I went looking this week with your goals in mind, and I found 5 things that genuinely match where you're trying to go. These aren't random — each one is a real move.`,
      opportunities: [
        {
          title: "TEDxManhattan — Speaker Applications Open",
          type: "Speaking",
          description: "TEDx's NYC flagship event is accepting speaker proposals for their fall showcase. 600+ attendees, filmed and distributed on YouTube.",
          fit: "A TEDx credit is one of the fastest ways to establish authority and attract the exact audience you're trying to reach.",
          cta: "Apply",
        },
        {
          title: "Morning Brew — Guest Contributor Open Call",
          type: "Writing",
          description: "Morning Brew is actively seeking expert opinion pieces from practitioners. 4M daily readers. Pieces run 600–900 words.",
          fit: "A byline here puts your thinking in front of your target audience every single morning.",
          cta: "Pitch",
        },
        {
          title: "How I Built This (NPR) — Guest Pitch",
          type: "Podcast",
          description: "Guy Raz's show accepts guest pitches via their website. 1M+ weekly listeners. Looking for compelling builder stories.",
          fit: "Your story is exactly what their audience tunes in for — getting on this show changes everything.",
          cta: "Pitch",
        },
        {
          title: "PEN America Emerging Voices Fellowship",
          type: "Fellowship",
          description: "Annual fellowship for writers from underrepresented communities. Includes mentorship, community, stipend. Applications open Q1.",
          fit: "The network from this program is worth more than any individual opportunity — past fellows consistently credit it with their first major break.",
          cta: "Apply",
        },
        {
          title: "CreativeMornings NYC — Speaker Application",
          type: "Speaking",
          description: "Monthly breakfast events for the NYC creative community. Free to attend, speakers selected from the community. 200+ attendees.",
          fit: "This is exactly the room where your goals and your audience overlap — editors, founders, creators, collaborators.",
          cta: "Apply",
        },
      ],
      recommendation: `Start with the TEDx application this week — the deadline is closer than you think and a strong application takes about an hour. Then pitch Morning Brew while your ideas are fresh. Those two moves alone could change your trajectory.`,
    }
  }

  const buildLineup = async () => {
    showResult()

    const msgs = [
      "Searching for opportunities that match your goals...",
      "Checking speaking calls, podcast openings, writing briefs...",
      "Filtering by your interests and topics...",
      "Putting together your personal Lineup...",
    ]

    let i = 0
    let w = 0
    const interval = setInterval(() => {
      w = Math.min(w + 22, 82)
      setLoadProgress(w)
      if (i < msgs.length) {
        setLoadMessage(msgs[i])
        i++
      }
    }, 900)

    const prompt = `You are The Lineup — a personalized weekly opportunity digest curated by Ben Hawes. Your tone is warm, direct, and specific. You sound like a well-connected friend who found these for someone, not a machine. DO NOT mention AI. Write as if a real person researched and curated this.

Generate a personalized Lineup for this person. Return ONLY valid JSON — no backticks, no preamble.

{
  "intro": "2-sentence warm, personal intro. Start with their name. Reference their specific goal and something personal/specific about what you found. Sound human.",
  "opportunities": [
    {
      "title": "Specific real-sounding opportunity name",
      "type": "Speaking | Writing | Podcast | Grant | Event | Job | Fellowship",
      "description": "2 sentences. Specific details: outlet/organization name, deadline if relevant, audience size if impressive.",
      "fit": "1 sentence starting with explaining exactly why THIS person should go after THIS opportunity, referencing their specific goal.",
      "cta": "Apply | Pitch | Submit | Attend | Connect"
    }
  ],
  "recommendation": "2 warm, direct sentences. Which 1-2 to start with this week and a very specific reason why. Sound like a trusted friend giving advice."
}

User profile:
- Name: ${userData.name || "there"}
- Location: ${userData.location || "not specified"}
- Interests: ${userData.interests.join(", ") || "general"}
- Topics: ${userData.topics.join(", ") || "general"}  
- Goal: ${userData.goal || "build their personal brand and career"}
- Blocker: ${userData.blocker || "not sure where to start"}
- Extra: ${userData.extra || "none"}

Generate 5 real, specific opportunities. Reference real organizations, real publications, real podcast shows, real conference types. Make it feel discovered, not invented. No AI language. No "curated by AI". Just human, warm, specific.`

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      clearInterval(interval)
      setLoadProgress(100)
      setTimeout(() => {
        setLoading(false)
        setResult(data)
      }, 500)
    } catch {
      clearInterval(interval)
      setLoadProgress(100)
      setTimeout(() => {
        setLoading(false)
        setResult(fallback(userData))
      }, 500)
    }
  }

  const handleChatComplete = (data: UserData) => {
    setUserData(data)
    showResult()
    buildLineupFromChat(data)
  }

  const buildLineupFromChat = async (chatData: UserData) => {
    const msgs = [
      "Searching for opportunities that match your goals...",
      "Checking speaking calls, podcast openings, writing briefs...",
      "Filtering by your interests and topics...",
      "Putting together your personal Lineup...",
    ]

    let i = 0
    let w = 0
    const interval = setInterval(() => {
      w = Math.min(w + 22, 82)
      setLoadProgress(w)
      if (i < msgs.length) {
        setLoadMessage(msgs[i])
        i++
      }
    }, 900)

    const prompt = `You are The Lineup — a personalized weekly opportunity digest curated by Ben Hawes. Your tone is warm, direct, and specific. You sound like a well-connected friend who found these for someone, not a machine. DO NOT mention AI. Write as if a real person researched and curated this.

Generate a personalized Lineup for this person. Return ONLY valid JSON — no backticks, no preamble.

{
  "intro": "2-sentence warm, personal intro. Start with their name. Reference their specific goal and something personal/specific about what you found. Sound human.",
  "opportunities": [
    {
      "title": "Specific real-sounding opportunity name",
      "type": "Speaking | Writing | Podcast | Grant | Event | Job | Fellowship",
      "description": "2 sentences. Specific details: outlet/organization name, deadline if relevant, audience size if impressive.",
      "fit": "1 sentence starting with explaining exactly why THIS person should go after THIS opportunity, referencing their specific goal.",
      "cta": "Apply | Pitch | Submit | Attend | Connect"
    }
  ],
  "recommendation": "2 warm, direct sentences. Which 1-2 to start with this week and a very specific reason why. Sound like a trusted friend giving advice."
}

User profile:
- Name: ${chatData.name || "there"}
- Location: ${chatData.location || "not specified"}
- Interests: ${chatData.interests.join(", ") || "general"}
- Topics: ${chatData.topics.join(", ") || "general"}  
- Goal: ${chatData.goal || "build their personal brand and career"}
- Blocker: ${chatData.blocker || "not sure where to start"}
- Extra: ${chatData.extra || "none"}

Generate 5 real, specific opportunities. Reference real organizations, real publications, real podcast shows, real conference types. Make it feel discovered, not invented. No AI language. No "curated by AI". Just human, warm, specific.`

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      clearInterval(interval)
      setLoadProgress(100)
      setTimeout(() => {
        setLoading(false)
        setResult(data)
      }, 500)
    } catch {
      clearInterval(interval)
      setLoadProgress(100)
      setTimeout(() => {
        setLoading(false)
        setResult(fallback(chatData))
      }, 500)
    }
  }

  const interests = ["Speaking", "Podcasting", "Writing", "Content Creation", "Events & Networking", "Comedy", "Startups", "Journalism", "Film & Video", "Music", "Design", "Tech"]
  const topics = ["AI & Technology", "Marketing", "Culture & Society", "Sustainability", "Health & Wellness", "Finance & Business", "Education", "Social Justice", "Science", "Food & Hospitality", "Sports", "History & Politics"]

  return (
    <>
      {/* HOME PAGE */}
      {currentPage === "home" && (
        <div>
          {/* Top Bar */}
          <div className="bg-black text-white text-center py-3 px-4 text-sm">
            <span className="mr-2">🎉</span> <strong>Free for 4 weeks</strong> — No credit card needed. Just show up on Monday.
          </div>

          {/* Nav */}
          <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-off-white sticky top-0 z-50 border-b border-border">
            <div className="font-serif text-xl md:text-2xl font-bold text-black">
              The <span className="gradient-text">Lineup</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-muted hover:text-foreground text-sm font-medium transition-colors">How It Works</a>
              <a href="#pricing" className="text-muted hover:text-foreground text-sm font-medium transition-colors">Pricing</a>
              <a href="#founder" className="text-muted hover:text-foreground text-sm font-medium transition-colors">About</a>
              <button onClick={showSurvey} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black/80 transition-colors">
                Get My Lineup →
              </button>
            </div>
          </nav>

          {/* Hero */}
          <section className="px-6 md:px-12 py-16 md:py-24">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-cream text-orange text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
                  Every Monday Morning
                </div>
                <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6 text-balance">
                  5 opportunities<br />you'd <em className="text-orange">never</em><br />find yourself.
                </h1>
                <p className="text-lg text-muted mb-8 max-w-lg leading-relaxed">
                  Speaking gigs. Podcast guest spots. Writing opportunities. Fellowships. Networking events.{" "}
                  <strong className="text-foreground">Curated specifically for you</strong> — based on your goals, your topics, your ambitions.
                </p>
                <button onClick={showSurvey} className="bg-gradient-to-r from-orange via-pink to-purple text-white px-8 py-4 rounded-full text-base font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-orange/30">
                  Start My Free 4-Week Trial
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <p className="text-sm text-muted mt-4">
                  4 weeks free, then <strong className="text-foreground">$9/month</strong>. Cancel anytime.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-semibold px-4 py-2 rounded-full z-10">
                  ↑ Sent every Monday 8am
                </div>
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange to-pink flex items-center justify-center text-white font-bold text-sm">TL</div>
                    <div>
                      <div className="font-semibold text-sm">The Lineup by Ben Hawes</div>
                      <div className="text-xs text-muted">Your Lineup is here — March 17</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm">
                      Hey <strong>Jordan</strong> — here are this week's 5 picks to help you land your first speaking gig and grow your audience in the sustainability space.
                    </p>
                    <div className="bg-off-white rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-orange font-bold text-lg">01</span>
                        <div>
                          <div className="font-semibold text-sm">GreenBiz Conference — Speaker CFP</div>
                          <span className="inline-block bg-cream text-orange text-xs font-semibold px-2 py-0.5 rounded-full mt-1">Speaking</span>
                          <p className="text-xs text-muted mt-2">Deadline April 12. Accepting proposals from sustainability practitioners & founders.</p>
                          <p className="text-xs text-orange mt-1">↳ This is your fastest path to a stage and your ideal audience in one room.</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-off-white rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-orange font-bold text-lg">02</span>
                        <div>
                          <div className="font-semibold text-sm">How to Save a Planet Podcast — Guest Pitch</div>
                          <span className="inline-block bg-cream text-orange text-xs font-semibold px-2 py-0.5 rounded-full mt-1">Podcast</span>
                          <p className="text-xs text-muted mt-2">{"Gimlet's climate podcast actively takes listener guest suggestions."}</p>
                          <p className="text-xs text-orange mt-1">↳ Your work on corporate sustainability is exactly what their audience wants to hear.</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm font-medium text-orange">+ 3 more opportunities inside →</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pitch Section */}
          <section className="bg-black text-white px-6 md:px-12 py-20">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
              <div>
                <div className="text-orange/80 text-xs font-bold uppercase tracking-wider mb-4">The Real Talk</div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-6">
                  Building an audience isn't just about <em className="text-orange">posting online.</em>
                </h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    The creators, founders, and professionals who actually <strong className="text-white">break through</strong> aren't just grinding away on social media. They're showing up where it counts:
                  </p>
                  <p>
                    <strong className="text-white">On stages.</strong> In podcast feeds. As bylines in industry publications. As guests in newsletters. As the person in the room that everyone wants to talk to.
                  </p>
                  <p>
                    The problem? Finding those opportunities is a full-time job. Deadlines get missed. Applications slip through the cracks. You never know what you don't know.
                  </p>
                  <p>
                    <strong className="text-white">{"That's exactly what The Lineup fixes."}</strong> Every week, a fresh set of real, specific, timely opportunities — matched to your goals, your industry, your ambitions — lands in your inbox before you've even had your coffee.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="font-serif text-5xl font-bold gradient-text mb-2">5</div>
                  <div className="text-sm text-white/60">Curated opportunities every single Monday</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="font-serif text-5xl font-bold gradient-text mb-2">20</div>
                  <div className="text-sm text-white/60">Opportunities per month, all matched to you</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="font-serif text-5xl font-bold gradient-text mb-2">$9</div>
                  <div className="text-sm text-white/60">Per month after your free trial</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="font-serif text-5xl font-bold gradient-text mb-2">0</div>
                  <div className="text-sm text-white/60">{"Hours spent searching. That's the whole point."}</div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="px-6 md:px-12 py-20 bg-off-white">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="text-orange text-xs font-bold uppercase tracking-wider mb-4">The Process</div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
                From sign-up to <em className="text-orange">opportunity</em><br />in minutes.
              </h2>
              <p className="text-muted">Four steps. No fluff. You go from "just browsing" to getting real opportunities by Monday.</p>
            </div>
            <div className="max-w-3xl mx-auto grid md:grid-cols-4 gap-8">
              {[
                ["1", "Tell us about you", "A 2-minute setup. Your interests, goals, topics, and what's been blocking you."],
                ["2", "We do the search", "We scan speaking calls, podcast openings, writing briefs, grants, and events across the web."],
                ["3", "Your Lineup gets built", "5 opportunities are handpicked and explained — including exactly why each one fits you."],
                ["4", "Monday delivery", "Your Lineup arrives 8am every Monday. No fluff, no spam — just moves you can make this week."],
              ].map(([num, title, desc]) => (
                <div key={num} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange to-pink text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">{num}</div>
                  <div className="font-semibold mb-2">{title}</div>
                  <div className="text-sm text-muted">{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="px-6 md:px-12 py-20 bg-cream">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-orange text-xs font-bold uppercase tracking-wider mb-4">Simple Pricing</div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  Start free. Stay for <em className="text-orange">results.</em>
                </h2>
              </div>
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-xl mx-auto text-center border border-border">
                <div className="text-sm text-orange font-bold mb-2">4 Weeks Free</div>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="font-serif text-6xl font-bold">$9</span>
                  <span className="text-muted">/month</span>
                </div>
                <p className="text-muted mb-6">after your free trial</p>
                <ul className="text-left space-y-3 mb-8">
                  {[
                    "5 personalized opportunities every Monday",
                    "Matched to your goals, topics, and ambitions",
                    "Speaking, podcasts, writing, fellowships, events",
                    "Explanation of why each opportunity fits you",
                    "Cancel anytime, no questions asked"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-orange mt-0.5">✓</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={showSurvey} className="w-full bg-gradient-to-r from-orange via-pink to-purple text-white py-4 rounded-full font-bold text-base hover:scale-105 transition-transform shadow-lg shadow-orange/30">
                  Start My Free Trial →
                </button>
                <p className="text-xs text-muted mt-4">No credit card required. Cancel anytime.</p>
              </div>
            </div>
          </section>

          {/* Founder */}
          <section id="founder" className="px-6 md:px-12 py-20 bg-off-white">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6_20250824_%C2%A9BrakeThrough%20Media_543A2208.JPG-TrE5dHbpudcCyu7LdOpvmz6N22hhUu.jpeg" 
                  alt="Ben Hawes holding photo booth pictures in front of gold tinsel backdrop"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="text-orange text-xs font-bold uppercase tracking-wider mb-4">Meet the Founder</div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                  {"I'm Ben."}<br />
                  <em className="text-orange">This is personal.</em>
                </h2>
                <div className="space-y-4 text-muted leading-relaxed">
                  <p>
                    I spent years in People/HR at companies like <strong className="text-foreground">Rocket Money</strong>, helping others build their careers. On the side, I run one of NYC's busiest photo booth companies — so I know what it means to hustle.
                  </p>
                  <p>
                    What I kept noticing: <strong className="text-foreground">The biggest opportunities aren't posted on job boards.</strong> They're scattered across a hundred different sites, newsletters, and Twitter threads. If you don't know where to look, you miss them.
                  </p>
                  <p>
                    The Lineup is the service I wish I had. Every week, I dig through the noise so you don't have to — and I send you only the stuff that actually fits your goals.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange to-pink flex items-center justify-center text-white font-bold">BH</div>
                  <div>
                    <div className="font-semibold">Ben Hawes</div>
                    <div className="text-sm text-muted">Founder, The Lineup</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="px-6 md:px-12 py-20 bg-black text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                Ready to stop scrolling and<br /><em className="text-orange">start showing up?</em>
              </h2>
              <p className="text-white/70 mb-8">
                Your first Lineup arrives Monday. 5 real opportunities, matched to you, waiting in your inbox.
              </p>
              <button onClick={showSurvey} className="bg-gradient-to-r from-orange via-pink to-purple text-white px-8 py-4 rounded-full font-bold text-base hover:scale-105 transition-transform shadow-lg shadow-orange/30">
                Get My First Lineup Free →
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="px-6 md:px-12 py-8 bg-black text-white/50 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="font-serif text-lg font-bold text-white">
                The <span className="gradient-text">Lineup</span>
              </div>
              <div className="text-sm">© 2024 The Lineup. Made in NYC.</div>
            </div>
          </footer>

          {/* Chatbot */}
          <Chatbot onComplete={handleChatComplete} />
        </div>
      )}

      {/* SURVEY PAGE */}
      {currentPage === "survey" && (
        <div className="min-h-screen bg-off-white">
          <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
            <button onClick={showHome} className="font-serif text-xl font-bold text-black">
              The <span className="gradient-text">Lineup</span>
            </button>
          </nav>

          <div className="max-w-2xl mx-auto px-6 py-12">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted mb-2">
                <span>{stepMeta[step - 1][0]}</span>
                <span>{step}/4</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange to-pink transition-all" style={{ width: `${(step / 4) * 100}%` }} />
              </div>
            </div>

            <h2 className="font-serif text-3xl font-bold mb-2">{stepMeta[step - 1][1]}</h2>
            <p className="text-muted mb-8">{stepMeta[step - 1][2]}</p>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First name</label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-orange text-base"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-orange text-base"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location (optional)</label>
                  <input
                    type="text"
                    value={userData.location}
                    onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-orange text-base"
                    placeholder="City, State or 'Remote'"
                  />
                </div>
                <button onClick={() => goStep(2)} className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-black/80 transition-colors">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium mb-4">What kinds of opportunities interest you?</label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleChip("interests", item)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          userData.interests.includes(item)
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-border hover:border-orange/50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-4">What topics are you passionate about?</label>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleChip("topics", item)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          userData.topics.includes(item)
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-border hover:border-orange/50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => goStep(1)} className="flex-1 py-4 rounded-full border border-border font-semibold hover:bg-white transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => goStep(3)} className="flex-1 bg-black text-white py-4 rounded-full font-semibold hover:bg-black/80 transition-colors">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">What's your main goal right now?</label>
                  <textarea
                    value={userData.goal}
                    onChange={(e) => setUserData({ ...userData, goal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-orange text-base min-h-[120px] resize-none"
                    placeholder="Be specific! 'Land my first TEDx talk' is better than 'speak more'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">What's been getting in the way?</label>
                  <textarea
                    value={userData.blocker}
                    onChange={(e) => setUserData({ ...userData, blocker: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-orange text-base min-h-[100px] resize-none"
                    placeholder="What's stopped you from making progress?"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => goStep(2)} className="flex-1 py-4 rounded-full border border-border font-semibold hover:bg-white transition-colors">
                    ← Back
                  </button>
                  <button onClick={() => goStep(4)} className="flex-1 bg-black text-white py-4 rounded-full font-semibold hover:bg-black/80 transition-colors">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Anything else I should know? (optional)</label>
                  <textarea
                    value={userData.extra}
                    onChange={(e) => setUserData({ ...userData, extra: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-orange text-base min-h-[150px] resize-none"
                    placeholder="Your background, what you've tried, what makes you *you*..."
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => goStep(3)} className="flex-1 py-4 rounded-full border border-border font-semibold hover:bg-white transition-colors">
                    ← Back
                  </button>
                  <button onClick={buildLineup} className="flex-1 bg-gradient-to-r from-orange via-pink to-purple text-white py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-orange/30">
                    Build My Lineup →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULT PAGE */}
      {currentPage === "result" && (
        <div className="min-h-screen bg-off-white">
          <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
            <button onClick={showHome} className="font-serif text-xl font-bold text-black">
              The <span className="gradient-text">Lineup</span>
            </button>
          </nav>

          <div className="max-w-3xl mx-auto px-6 py-12">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange to-pink mb-6 animate-pulse">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4">{loadMessage || "Building your Lineup..."}</h2>
                <div className="max-w-xs mx-auto h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange to-pink transition-all duration-500" style={{ width: `${loadProgress}%` }} />
                </div>
              </div>
            ) : result ? (
              <div>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange to-pink mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-3xl font-bold mb-4">Your Lineup is Ready</h2>
                  <p className="text-muted max-w-lg mx-auto">{result.intro}</p>
                </div>

                <div className="space-y-4 mb-12">
                  {result.opportunities.map((opp, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl font-bold gradient-text font-serif">0{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-semibold text-lg">{opp.title}</h3>
                            <span className="shrink-0 bg-cream text-orange text-xs font-bold px-3 py-1 rounded-full">{opp.type}</span>
                          </div>
                          <p className="text-muted text-sm mb-3">{opp.description}</p>
                          <p className="text-orange text-sm font-medium">↳ {opp.fit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-black text-white rounded-2xl p-8 mb-8">
                  <h3 className="font-serif text-xl font-bold mb-3">My Recommendation</h3>
                  <p className="text-white/80">{result.recommendation}</p>
                </div>

                <div className="text-center">
                  <p className="text-muted mb-6">
                    This is just a preview. Your real Lineup arrives every Monday at 8am with fresh opportunities.
                  </p>
                  <button onClick={showHome} className="bg-gradient-to-r from-orange via-pink to-purple text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-orange/30">
                    Back to Home
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}
