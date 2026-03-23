"use client"

import { Logo } from "@/components/logo"
import { ArrowDown, ArrowRight, Calendar, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col px-6 py-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 glow-orange" />
      <div className="absolute inset-0 glow-pink" />
      <div className="absolute inset-0 glow-purple" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Logo size="md" />
        <Link 
          href="/get-started"
          className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all cursor-pointer"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>
      
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 max-w-6xl mx-auto w-full mt-12 lg:mt-0">
        {/* Left side - Copy */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Every Monday at 9am</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Stop searching for opportunities.
            <span className="block gradient-brand-text mt-2">Let them find you.</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
            I spent years hunting for speaking gigs, podcast spots, and the right publications. Now I've built something that does the hunting for you — personalized to your exact goals.
          </p>
          
          {/* Trust indicators */}
          <div className="mt-6 flex flex-col sm:flex-row items-center lg:items-start gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>5 curated opportunities weekly</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Matched to YOUR profile</span>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4">
            <Link
              href="/get-started"
              className="w-full sm:w-auto h-14 px-8 rounded-full gradient-brand text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-[1.02] shadow-2xl shadow-primary/20 cursor-pointer flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Get Your First Lineup Free
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>
        </div>
        
        {/* Right side - Personal photo + quote */}
        <div className="flex-shrink-0 relative">
          <div className="relative">
            {/* Photo */}
            <div className="w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <Image
                src="/images/ben-hawes.jpg"
                alt="Ben Hawes - Founder of The Lineup"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-card border border-border rounded-2xl p-4 shadow-xl max-w-[260px]">
              <p className="text-sm text-white font-medium leading-relaxed">
                "I built this because I was tired of missing out on opportunities I didn't even know existed."
              </p>
              <p className="mt-2 text-xs text-primary font-semibold">
                — Ben Hawes, Founder
              </p>
            </div>
            
            {/* Accent glow */}
            <div className="absolute -inset-4 rounded-3xl gradient-brand opacity-20 -z-10 blur-2xl" />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <button 
        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
        className="relative z-10 mt-8 lg:mt-0 animate-bounce cursor-pointer hover:text-primary transition-colors self-center"
      >
        <ArrowDown className="w-6 h-6 text-muted-foreground hover:text-primary" />
      </button>
    </section>
  )
}
