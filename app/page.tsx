"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import styles from "./page.module.css"
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

  return (
    <>
      {/* HOME PAGE */}
      {currentPage === "home" && (
        <div id="page-home">
          <div className={styles.topBar}>
            <span className={styles.emoji}>🎉</span> <strong>Free for 4 weeks</strong> — No credit card needed. Just show up on Monday.
          </div>

          <nav className={styles.nav}>
            <div className={styles.logo}>
              The <span>Lineup</span>
            </div>
            <div className={styles.navRight}>
              <a href="#how-it-works" className={styles.navLink}>How It Works</a>
              <a href="#pricing" className={styles.navLink}>Pricing</a>
              <a href="#founder" className={styles.navLink}>About</a>
              <button className={styles.btnNav} onClick={showSurvey}>Get My Lineup →</button>
            </div>
          </nav>

          {/* HERO */}
          <section>
            <div className={styles.hero}>
              <div className={styles.heroLeft}>
                <div className={styles.heroKicker}>Every Monday Morning</div>
                <h1 className={styles.h1}>
                  5 opportunities<br />you'd <em>never</em><br />find yourself.
                </h1>
                <p className={styles.heroSub}>
                  Speaking gigs. Podcast guest spots. Writing opportunities. Fellowships. Networking events.{" "}
                  <strong>Curated specifically for you</strong> — based on your goals, your topics, your ambitions.
                </p>
                <button className={styles.btnPrimary} onClick={showSurvey}>
                  Start My Free 4-Week Trial
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className={styles.ctaFine}>
                  4 weeks free, then <strong>$9/month</strong>. Cancel anytime.
                </span>
              </div>

              <div className={styles.heroVisual}>
                <div className={styles.floatingBadge}>↑ Sent every Monday 8am</div>
                <div className={styles.emailPreviewCard}>
                  <div className={styles.epHeader}>
                    <div className={styles.epAvatar}>TL</div>
                    <div className={styles.epMeta}>
                      <div className={styles.epFrom}>The Lineup by Ben Hawes</div>
                      <div className={styles.epSubject}>Your Lineup is here — March 17</div>
                    </div>
                  </div>
                  <div className={styles.epBody}>
                    <div className={styles.epGreeting}>
                      Hey <strong>Jordan</strong> — here are this week's 5 picks to help you land your first speaking gig and grow your audience in the sustainability space.
                    </div>
                    <div className={styles.epOpp}>
                      <div className={styles.epOppNum}>01</div>
                      <div className={styles.epOppTitle}>GreenBiz Conference — Speaker CFP</div>
                      <span className={styles.epOppTag}>Speaking</span>
                      <div className={styles.epOppDesc}>Deadline April 12. Accepting proposals from sustainability practitioners & founders.</div>
                      <div className={styles.epOppFit}>↳ This is your fastest path to a stage and your ideal audience in one room.</div>
                    </div>
                    <div className={styles.epOpp}>
                      <div className={styles.epOppNum}>02</div>
                      <div className={styles.epOppTitle}>How to Save a Planet Podcast — Guest Pitch</div>
                      <span className={styles.epOppTag}>Podcast</span>
                      <div className={styles.epOppDesc}>{"Gimlet's climate podcast actively takes listener guest suggestions."}</div>
                      <div className={styles.epOppFit}>↳ Your work on corporate sustainability is exactly what their audience wants to hear.</div>
                    </div>
                    <div className={styles.epMore}>+ 3 more opportunities inside →</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* THE PITCH */}
          <section className={styles.pitchSection}>
            <div className={styles.sectionInner}>
              <div className={styles.pitchGrid}>
                <div className={styles.pitchLeft}>
                  <div className={styles.sectionKicker} style={{ color: "rgba(249,69,1,0.8)" }}>The Real Talk</div>
                  <h2 className={styles.h2}>
                    Building an audience isn't just about <em>posting online.</em>
                  </h2>
                  <div className={styles.pitchBody}>
                    <p>
                      The creators, founders, and professionals who actually <strong>break through</strong> aren't just grinding away on social media. They're showing up where it counts:
                    </p>
                    <p>
                      <strong>On stages.</strong> In podcast feeds. As bylines in industry publications. As guests in newsletters. As the person in the room that everyone wants to talk to.
                    </p>
                    <p>
                      The problem? Finding those opportunities is a full-time job. Deadlines get missed. Applications slip through the cracks. You never know what you don't know.
                    </p>
                    <p>
                      <strong>{"That's exactly what The Lineup fixes."}</strong> Every week, a fresh set of real, specific, timely opportunities — matched to your goals, your industry, your ambitions — lands in your inbox before you've even had your coffee.
                    </p>
                  </div>
                </div>
                <div>
                  <div className={styles.pitchStats}>
                    <div className={styles.statBox}>
                      <div className={styles.statNum}>5</div>
                      <div className={styles.statLabel}>Curated opportunities every single Monday</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.statNum}>20</div>
                      <div className={styles.statLabel}>Opportunities per month, all matched to you</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.statNum}>$9</div>
                      <div className={styles.statLabel}>Per month after your free trial</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.statNum}>0</div>
                      <div className={styles.statLabel}>{"Hours spent searching. That's the whole point."}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className={styles.stepsSection} id="how-it-works">
            <div className={styles.sectionInner}>
              <div className={styles.stepsHeader}>
                <div className={styles.sectionKicker}>The Process</div>
                <h2 className={styles.h2}>
                  From sign-up to <em>opportunity</em>
                  <br />
                  in minutes.
                </h2>
                <p>Four steps. No fluff. You go from "just browsing" to getting real opportunities by Monday.</p>
              </div>
              <div className={styles.timeline}>
                <div className={styles.tlStep}>
                  <div className={styles.tlCircle}>1</div>
                  <div className={styles.tlTitle}>Tell us about you</div>
                  <div className={styles.tlDesc}>A 2-minute setup. Your interests, goals, topics, and what's been blocking you.</div>
                </div>
                <div className={styles.tlStep}>
                  <div className={styles.tlCircle}>2</div>
                  <div className={styles.tlTitle}>We do the search</div>
                  <div className={styles.tlDesc}>We scan speaking calls, podcast openings, writing briefs, grants, and events across the web.</div>
                </div>
                <div className={styles.tlStep}>
                  <div className={styles.tlCircle}>3</div>
                  <div className={styles.tlTitle}>Your Lineup gets built</div>
                  <div className={styles.tlDesc}>5 opportunities are handpicked and explained — including exactly why each one fits you.</div>
                </div>
                <div className={styles.tlStep}>
                  <div className={styles.tlCircle}>4</div>
                  <div className={styles.tlTitle}>Monday morning magic</div>
                  <div className={styles.tlDesc}>Your Lineup hits your inbox at 8am. Click. Apply. Show up. Repeat every week.</div>
                </div>
              </div>
            </div>
          </section>

          {/* WHY IT WORKS */}
          <section style={{ background: "var(--off-white)" }}>
            <div className={styles.sectionInner}>
              <div className={styles.sectionKicker}>Why It Works</div>
              <h2 className={styles.h2}>
                {"It's for people who are"} <em>building something.</em>
              </h2>
              <div className={styles.whyGrid}>
                <div className={styles.whyCard}>
                  <span className={styles.whyIcon}>🎤</span>
                  <div className={styles.whyTitle}>Speakers & Panelists</div>
                  <div className={styles.whyDesc}>CFPs open and close fast. We catch them before they're gone — conferences, summits, panels — filtered for your industry and expertise level.</div>
                </div>
                <div className={styles.whyCard}>
                  <span className={styles.whyIcon}>🎙️</span>
                  <div className={styles.whyTitle}>Podcast Guests</div>
                  <div className={styles.whyDesc}>Guesting on podcasts is one of the fastest ways to build an audience. We find shows actively looking for people with your story.</div>
                </div>
                <div className={styles.whyCard}>
                  <span className={styles.whyIcon}>✍️</span>
                  <div className={styles.whyTitle}>Writers & Byliners</div>
                  <div className={styles.whyDesc}>Have a business or expertise? Writing for industry publications builds credibility fast. We surface briefs, calls for submissions, and guest post opportunities.</div>
                </div>
                <div className={styles.whyCard}>
                  <span className={styles.whyIcon}>🚀</span>
                  <div className={styles.whyTitle}>Founders & Operators</div>
                  <div className={styles.whyDesc}>The best founders are visible ones. We find fellowships, startup competitions, speaking invites, and press opportunities your competitors are missing.</div>
                </div>
                <div className={styles.whyCard}>
                  <span className={styles.whyIcon}>🌐</span>
                  <div className={styles.whyTitle}>Online Creators Going IRL</div>
                  <div className={styles.whyDesc}>Online presence is one thing. Walking into a room that already knows your name is another. Events and live stages take you from follower count to real relationships.</div>
                </div>
                <div className={styles.whyCard}>
                  <span className={styles.whyIcon}>💼</span>
                  <div className={styles.whyTitle}>Career Builders</div>
                  <div className={styles.whyDesc}>Fellowships, grants, networking events, job opportunities in your niche — we find the things that move careers forward that job boards will never show you.</div>
                </div>
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section className={styles.pricingSection} id="pricing">
            <div className={styles.sectionInner} style={{ textAlign: "center" }}>
              <div className={styles.sectionKicker}>Simple Pricing</div>
              <h2 className={styles.h2}>Try it free. Keep it if you love it.</h2>
              <p className={styles.pricingIntro}>4 weeks on us. No credit card needed. If The Lineup helps you land even one opportunity — it's already paid for itself many times over.</p>

              <div className={styles.pricingCard}>
                <div className={styles.pricingBadge}>🎉 4 Weeks Free, Then...</div>
                <div className={styles.pricingPrice}>
                  <sup>$</sup>9
                </div>
                <div className={styles.pricingPer}>
                  per month — <strong>cancel anytime</strong>
                </div>

                <ul className={styles.pricingList}>
                  <li>5 curated opportunities delivered every Monday</li>
                  <li>20 personalized opportunities per month</li>
                  <li>Every pick matched to your goals, topics & style</li>
                  <li>Why it fits you — explained in plain language</li>
                  <li>{"Weekly \"start here\" recommendation from Ben"}</li>
                  <li>Speaking gigs, podcasts, writing, grants, events & more</li>
                  <li>Deadlines you'd otherwise miss — surfaced for you</li>
                  <li>Reply directly to Ben with questions or feedback</li>
                </ul>

                <button className={styles.btnPrimary} style={{ width: "100%", justifyContent: "center" }} onClick={showSurvey}>
                  Start My Free 4 Weeks
                </button>
                <p className={styles.pricingNote}>No credit card required for your free trial. After 4 weeks, it's $9/month to keep the Lineups coming.</p>
              </div>
            </div>
          </section>

          {/* FOUNDER */}
          <section className={styles.founderSection} id="founder">
            <div className={styles.sectionInner}>
              <div className={styles.founderGrid}>
                <div className={styles.founderLeft}>
                  <div className={styles.founderPhoto}>
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6_20250824_%C2%A9BrakeThrough%20Media_543A2208.JPG-TrE5dHbpudcCyu7LdOpvmz6N22hhUu.jpeg"
                      alt="Ben Hawes holding photo booth pictures in front of gold tinsel backdrop"
                    />
                  </div>
                  <div className={styles.founderTag}>👋 Made in NYC</div>
                </div>
                <div className={styles.founderRight}>
                  <div className={styles.sectionKicker} style={{ color: "rgba(249,69,1,0.8)" }}>From Ben</div>
                  <h2 className={styles.h2} style={{ color: "white" }}>
                    I built this because
                    <br />I <em style={{ color: "var(--pink)" }}>needed</em> it myself.
                  </h2>
                  <div className={styles.founderBody}>
                    <p>
                      I work on People Team & Enablement Tools at Rocket Money. I also run a <strong>successful photo booth events business here in NYC.</strong> I'm building my personal brand — and honestly? I've been doing this stuff for a while.
                    </p>
                    <div className={styles.founderQuote}>
                      "I kept missing speaking deadlines. Podcast opportunities. Writing calls. Not because I wasn't interested — because I never knew they existed until it was too late."
                    </div>
                    <p>
                      So I built a system that does the searching for me. I pull opportunities from across the web — conferences, podcasts, fellowships, industry publications — and filter them down to what actually makes sense for my goals that week.
                    </p>
                    <p>
                      <strong>The results were immediate.</strong> I started landing speaking gigs and podcast appearances I would have never found. Deadlines I would have missed showed up in my inbox before they closed.
                    </p>
                    <p>
                      I realized this wasn't just useful for me. If you're building a personal brand — whether you're a founder, a creator, a career climber, or someone who just has something to say — you need this flow.
                    </p>
                    <p>
                      So I turned it into The Lineup. <strong>Brought to you by Ben Hawes HQ.</strong> Built for people like you.
                    </p>
                  </div>
                  <div className={styles.founderBadges}>
                    <div className={styles.founderBadge}>🚀 Rocket Money</div>
                    <div className={styles.founderBadge}>📸 NYC Photo Booth Events</div>
                    <div className={styles.founderBadge}>🎤 Speaker</div>
                    <div className={styles.founderBadge}>🎙️ Podcast Guest</div>
                    <div className={styles.founderBadge}>📍 New York City</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SOCIAL PROOF */}
          <section className={styles.proofSection}>
            <div className={styles.sectionInner} style={{ textAlign: "center" }}>
              <div className={styles.sectionKicker}>Early Members Say</div>
              <h2 className={styles.h2}>
                Real people. <em>Real moves.</em>
              </h2>
              <div className={styles.proofCards}>
                <div className={styles.proofCard}>
                  <div className={styles.proofStars}>★★★★★</div>
                  <div className={styles.proofText}>"I applied to a speaking opportunity I found in my first Lineup. It was exactly the kind of conference I'd been hoping to speak at — and I'd never heard of it before."</div>
                  <div className={styles.proofAuthor}>
                    <span>Tanya R.</span>Marketing Consultant, Brooklyn
                  </div>
                </div>
                <div className={styles.proofCard}>
                  <div className={styles.proofStars}>★★★★★</div>
                  <div className={styles.proofText}>"The podcast guest pitch in my second Lineup turned into an actual booking. That episode drove more new followers than 6 months of posting on my own."</div>
                  <div className={styles.proofAuthor}>
                    <span>Derek M.</span>SaaS Founder, NYC
                  </div>
                </div>
                <div className={styles.proofCard}>
                  <div className={styles.proofStars}>★★★★★</div>
                  <div className={styles.proofText}>"What gets me is the 'why it fits you' part. It doesn't feel like a random list — it feels like someone who knows me found these specifically for me."</div>
                  <div className={styles.proofAuthor}>
                    <span>Priya S.</span>Writer & Brand Strategist
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className={styles.finalCtaSection}>
            <div className={styles.sectionInner} style={{ padding: "100px 48px", textAlign: "center" }}>
              <h2 className={styles.h2} style={{ color: "white", fontSize: "clamp(36px, 5vw, 56px)" }}>
                Your next opportunity
                <br />
                is out there. Let's <em style={{ color: "var(--pink)" }}>find it.</em>
              </h2>
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", maxWidth: "500px", margin: "0 auto 48px", fontWeight: 300 }}>
                Takes 2 minutes to set up. First Lineup hits your inbox by Monday. 4 weeks free — no card needed.
              </p>
              <button className={styles.btnPrimary} style={{ fontSize: "17px", padding: "20px 44px" }} onClick={showSurvey}>
                Get My First Lineup Free
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div style={{ marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>Have questions? Reply to any email — Ben reads every single one.</div>
            </div>
          </section>

          <footer className={styles.footer}>
            <div className={styles.footerLogo}>
              The <span>Lineup</span>
            </div>
            <div className={styles.footerText}>
              Built by <a href="#founder">Ben Hawes HQ</a> · New York City · <a href="mailto:lineup@benhaweHQ.co">lineup@benhaweHQ.co</a>
            </div>
            <div className={styles.footerText}>© 2025 Ben Hawes HQ</div>
          </footer>
        </div>
      )}

      {/* SURVEY PAGE */}
      {currentPage === "survey" && (
        <div id="page-survey">
          <div className={styles.surveyPageWrap}>
            <div className={styles.surveyHeader}>
              <div className={styles.logo}>
                The <span>Lineup</span>
              </div>
              <button className={styles.btnBack} onClick={showHome}>
                ← Back to home
              </button>
            </div>
            <div className={styles.surveyContainer}>
              <div className={styles.progressBarWrap}>
                <div className={styles.progressBarFill} style={{ width: `${(step / 4) * 100}%` }} />
              </div>
              <div className={styles.surveyStepLabel}>{stepMeta[step - 1][0]}</div>
              <div className={styles.surveyStepTitle}>{stepMeta[step - 1][1]}</div>
              <div className={styles.surveyStepSub}>{stepMeta[step - 1][2]}</div>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input type="text" placeholder="e.g. Jordan" value={userData.name} onChange={(e) => setUserData((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input type="email" placeholder="you@example.com" value={userData.email} onChange={(e) => setUserData((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Location (optional — helps us find local events)</label>
                    <input type="text" placeholder="e.g. New York, NY" value={userData.location} onChange={(e) => setUserData((p) => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className={styles.surveyNav}>
                    <button className={styles.btnNext} onClick={() => goStep(2)}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className={styles.formGroup}>
                    <label>{"I'm interested in (pick all that apply)"}</label>
                    <div className={styles.chipsWrap}>
                      {["Speaking", "Podcasting", "Writing", "Content Creation", "Comedy", "Events & Networking", "Startups & Entrepreneurship", "Journalism", "Film & Video", "Music", "Design & Creative", "Tech"].map((c) => (
                        <button key={c} className={`${styles.chip} ${userData.interests.includes(c) ? styles.selected : ""}`} onClick={() => toggleChip("interests", c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ marginTop: "28px" }}>
                    <label>Topics I care about</label>
                    <div className={styles.chipsWrap}>
                      {["AI & Technology", "Marketing", "Culture & Society", "Sustainability", "Health & Wellness", "Finance & Business", "Education", "Social Justice", "Space & Science", "Food & Hospitality", "Sports", "History & Politics"].map((c) => (
                        <button key={c} className={`${styles.chip} ${userData.topics.includes(c) ? styles.selected : ""}`} onClick={() => toggleChip("topics", c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.surveyNav}>
                    <button className={styles.btnBack} onClick={() => goStep(1)}>
                      ← Back
                    </button>
                    <button className={styles.btnNext} onClick={() => goStep(3)}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <div className={styles.formGroup}>
                    <label>My main goal right now</label>
                    <textarea rows={3} placeholder="e.g. Get booked on my first podcast, land a speaking gig at a marketing conference, grow my newsletter to 5,000 subscribers, publish my book..." value={userData.goal} onChange={(e) => setUserData((p) => ({ ...p, goal: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{"What's been blocking me"}</label>
                    <textarea rows={3} placeholder="e.g. I don't know where to look, I haven't built an audience yet, I'm not sure how to pitch myself, I keep missing deadlines..." value={userData.blocker} onChange={(e) => setUserData((p) => ({ ...p, blocker: e.target.value }))} />
                  </div>
                  <div className={styles.surveyNav}>
                    <button className={styles.btnBack} onClick={() => goStep(2)}>
                      ← Back
                    </button>
                    <button className={styles.btnNext} onClick={() => goStep(4)}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div>
                  <div className={styles.formGroup}>
                    <label>Anything else that would help me find the right stuff?</label>
                    <textarea rows={5} placeholder="Tell me more — your background, your vibe, what you've already tried, what you're sick of seeing, what a win looks like for you. The more I know, the better your Lineup." value={userData.extra} onChange={(e) => setUserData((p) => ({ ...p, extra: e.target.value }))} />
                  </div>
                  <div className={styles.surveyNav}>
                    <button className={styles.btnBack} onClick={() => goStep(3)}>
                      ← Back
                    </button>
                    <button className={`${styles.btnNext} ${styles.grad}`} onClick={buildLineup}>
                      Build My Lineup 🎯
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESULT PAGE */}
      {currentPage === "result" && (
        <div id="page-result">
          <div className={styles.resultPageBg}>
            <div className={styles.surveyHeader}>
              <div className={styles.logo}>
                The <span>Lineup</span>
              </div>
              <button className={styles.btnBack} onClick={showHome}>
                ← Start over
              </button>
            </div>
            <div className={styles.resultContainer}>
              {loading ? (
                <div className={styles.loadingCenter}>
                  <div className={styles.loader} />
                  <div className={styles.loadLabel}>{loadMessage || "Searching for opportunities that match your goals..."}</div>
                  <div className={styles.loadBarWrap}>
                    <div className={styles.loadBar} style={{ width: `${loadProgress}%` }} />
                  </div>
                </div>
              ) : (
                result && (
                  <div>
                    <div className={`${styles.resultKicker} ${styles.fadeUp} ${styles.d1}`}>Your Lineup is ready</div>
                    <div
                      className={`${styles.resultTitle} ${styles.fadeUp} ${styles.d2}`}
                      dangerouslySetInnerHTML={{
                        __html: userData.name ? `Hey ${userData.name} —<br />Here are your five.` : "Here are your five.",
                      }}
                    />
                    <div className={`${styles.resultIntro} ${styles.fadeUp} ${styles.d3}`} dangerouslySetInnerHTML={{ __html: result.intro.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />

                    {result.opportunities.map((o, i) => (
                      <div key={i} className={`${styles.rOppCard} ${styles.fadeUp}`} style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
                        <div className={styles.rTop}>
                          <div className={styles.rTitle}>
                            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>0{i + 1} &nbsp;</span>
                            {o.title}
                          </div>
                          <div className={styles.rBadge}>{o.type}</div>
                        </div>
                        <div className={styles.rDesc}>{o.description}</div>
                        <div className={styles.rFit}>↳ {o.fit}</div>
                        <a className={styles.rCta}>{o.cta} →</a>
                      </div>
                    ))}

                    {result.recommendation && (
                      <div className={`${styles.rRec} ${styles.fadeUp} ${styles.d6}`}>
                        <div className={styles.rRecLabel}>{"Ben's take this week"}</div>
                        <div className={styles.rRecText} dangerouslySetInnerHTML={{ __html: result.recommendation.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                      </div>
                    )}

                    <div className={`${styles.rConfirm} ${styles.fadeUp}`} style={{ animationDelay: "0.65s" }}>
                      <div className={styles.rConfirmIcon}>📬</div>
                      <div className={styles.rConfirmText}>
                        <strong>{"You're in. Lineups start Monday."}</strong>
                        {"Your first full Lineup hits your inbox this Monday at 8am. 4 weeks free — after that it's $9/month. You'll never miss an opportunity again."}
                        <div style={{ marginTop: "10px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Brought to you by Ben Hawes HQ · Have feedback? Just reply to the email.</div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Widget */}
      {currentPage === "home" && <Chatbot onComplete={handleChatComplete} />}
    </>
  )
}
