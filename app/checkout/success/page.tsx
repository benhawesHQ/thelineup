"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Check, Calendar, Mail, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const isMock = searchParams.get("mock") === "true"

  useEffect(() => {
    // Simulate loading for mock mode or verify session
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full gradient-brand flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl text-white font-medium">Setting up your Lineup...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      {/* Background effects */}
      <div className="fixed inset-0 glow-orange pointer-events-none" />
      <div className="fixed inset-0 glow-pink pointer-events-none" />
      
      <div className="relative z-10 max-w-lg mx-auto text-center">
        <Logo size="md" />
        
        {/* Success icon */}
        <div className="mt-12 w-20 h-20 mx-auto rounded-full gradient-brand flex items-center justify-center">
          <Check className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="mt-8 text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
          YOU'RE IN
        </h1>
        
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
          Welcome to The Lineup. Your first 4 weeks are on us — after that, it's just $9/month to keep the opportunities coming.
        </p>
        
        {/* What to expect */}
        <div className="mt-10 p-6 rounded-2xl bg-card border border-border text-left">
          <h3 className="font-bold text-white mb-4">What happens next:</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-white">Monday at 9am</p>
                <p className="text-sm text-muted-foreground">Your first Lineup arrives in your inbox</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-white">5 opportunities, picked for you</p>
                <p className="text-sm text-muted-foreground">Speaking gigs, podcasts, bylines, and more</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-white">100% custom to you</p>
                <p className="text-sm text-muted-foreground">Every opportunity matched to your goals</p>
              </div>
            </div>
          </div>
        </div>
        
        <Link href="/">
          <Button className="mt-10 h-14 px-8 rounded-full gradient-brand text-white font-semibold text-lg hover:opacity-90 transition-all cursor-pointer">
            Back to Home
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        
        <p className="mt-6 text-sm text-muted-foreground">
          Questions? Reach out at{" "}
          <a href="mailto:hello@thelineup.app" className="text-primary hover:underline">
            hello@thelineup.app
          </a>
        </p>
      </div>
    </main>
  )
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full gradient-brand flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-xl text-white font-medium">Loading...</p>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}
