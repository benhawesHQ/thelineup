"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Sparkles, Mic } from "lucide-react"
import { LogoMark } from "@/components/logo"
import Link from "next/link"

const demoConversation = [
  { role: "assistant", content: "Hey! What do you do? What's your main thing?" },
  { role: "user", content: "I'm a designer who speaks at conferences about UX" },
  { role: "assistant", content: "Nice! Love working with speakers. What kind of visibility are you looking for?" },
  { role: "user", content: "Bigger stages, podcast features, maybe some bylines" },
  { role: "assistant", content: "Got it. What topics are you known for (or want to be known for)?" },
  { role: "user", content: "Design systems, accessibility, building design culture" },
  { role: "assistant", content: "Perfect. Your first Lineup drops Monday at 9am with opportunities matched to exactly this." }
]

export function ChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!isAnimating) return
    
    if (visibleMessages < demoConversation.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      // Reset after showing all
      const resetTimer = setTimeout(() => {
        setVisibleMessages(0)
        setIsAnimating(true)
      }, 4000)
      return () => clearTimeout(resetTimer)
    }
  }, [visibleMessages, isAnimating])

  // Start animation when component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimating(true)
          setVisibleMessages(1)
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById("chat-demo-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="chat-demo-section" className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">A conversation, not a form</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white text-balance">
              TELL US<br />
              <span className="gradient-brand-text">ABOUT YOURSELF</span>
            </h2>
            
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed text-pretty">
              No boring forms. No dropdown menus. Just a quick chat where you tell us what you're about and what you're looking for. Type or use your voice — whatever's easier.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-muted-foreground">Tell us what you do and what kind of visibility you're after</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-muted-foreground">Share your topics and goals — we'll ask follow-ups if we need more</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-muted-foreground">Drop your email and get your first Lineup on Monday</p>
              </div>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/get-started"
                className="h-14 px-8 rounded-full gradient-brand text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Start the Conversation
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mic className="w-4 h-4" />
                <span>Voice enabled</span>
              </div>
            </div>
          </div>
          
          {/* Right - Chat mockup */}
          <div className="relative">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/50">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                  <LogoMark size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">The Lineup</h3>
                  <p className="text-xs text-muted-foreground">Let's get you set up</p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="p-4 space-y-4 min-h-[350px] max-h-[400px] overflow-hidden">
                {demoConversation.slice(0, visibleMessages).map((message, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-md" 
                        : "bg-secondary text-white rounded-bl-md"
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {visibleMessages > 0 && visibleMessages < demoConversation.length && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fake input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <div className="flex-1 h-11 rounded-lg bg-secondary border border-border flex items-center px-4 justify-between">
                    <span className="text-sm text-muted-foreground">Type or tap mic to talk...</span>
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="h-11 w-11 rounded-lg gradient-brand flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
