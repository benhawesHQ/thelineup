"use client"

import { Logo } from "@/components/logo"
import { ArrowDown, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 glow-orange" />
      <div className="absolute inset-0 glow-pink" />
      <div className="absolute inset-0 glow-purple" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        <Logo size="lg" />
        
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Every Monday at 9am</span>
        </div>
        
        <h1 className="mt-8 text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight leading-[0.95] text-white text-balance">
          <span className="block">YOUR 100% CUSTOM</span>
          <span className="block gradient-brand-text">WEEKLY LINEUP</span>
          <span className="block">OF OPPORTUNITIES</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty">
          Building an audience isn't just about posting online. It's about getting in front of people — speaking gigs, podcast features, bylines in the right publications. The Lineup finds these opportunities for you, based on <span className="text-white font-medium">who you are</span> and <span className="text-white font-medium">where you're headed</span>.
        </p>
        
        <Link
          href="/get-started"
          className="mt-10 h-16 px-12 rounded-full gradient-brand text-white font-semibold text-xl hover:opacity-90 transition-all hover:scale-[1.02] shadow-2xl shadow-primary/20 cursor-pointer flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          Get Your First Lineup
        </Link>
        
        <p className="mt-4 text-sm text-muted-foreground">
          First 4 weeks free. No credit card required.
        </p>
        
        {/* Scroll indicator */}
        <button 
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-16 animate-bounce cursor-pointer hover:text-primary transition-colors"
        >
          <ArrowDown className="w-6 h-6 text-muted-foreground hover:text-primary" />
        </button>
      </div>
    </section>
  )
}
