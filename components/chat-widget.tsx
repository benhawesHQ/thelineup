"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo"
import Link from "next/link"

export function ChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  // Auto-expand after a delay on first visit
  useEffect(() => {
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsExpanded(true)
        setHasShown(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [hasShown])

  return (
    <>
      {/* Expanded preview card */}
      <div 
        className={`fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-32px)] max-w-sm transition-all duration-300 ${
          isExpanded 
            ? "translate-y-0 opacity-100" 
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                <LogoMark size={24} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm leading-relaxed">
                  Hey! Ready to find opportunities that actually fit what you're building? Takes about 2 minutes.
                </p>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            
            <Link href="/get-started">
              <Button className="w-full h-12 gradient-brand text-white font-semibold cursor-pointer group">
                Get Your First Lineup
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              First 4 weeks free. No credit card needed.
            </p>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <Link 
        href="/get-started"
        className="fixed bottom-6 right-4 md:right-6 z-50 group"
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full gradient-brand animate-ping opacity-30" />
          
          {/* Button */}
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full gradient-brand shadow-2xl shadow-primary/30 flex items-center justify-center transition-transform group-hover:scale-110">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          
          {/* Label on desktop */}
          <div className="hidden md:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card border border-border rounded-full px-4 py-2 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm text-white font-medium">Get Your First Lineup</span>
          </div>
        </div>
      </Link>
    </>
  )
}
