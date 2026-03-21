"use client"

import { useState } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowRight, Check } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubscribed(true)
    setLoading(false)
  }

  return (
    <footer className="border-t border-border py-16 px-6 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        {/* Newsletter section */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Stay in the loop</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Keep me posted on future lineups
          </h3>
          <p className="text-muted-foreground mb-8">
            Not ready to sign up yet? Drop your email and we'll keep you in the loop on new features and updates.
          </p>
          
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-medium">You're on the list. We'll be in touch.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-card border-border text-white placeholder:text-muted-foreground focus:border-primary"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="h-12 px-6 gradient-brand text-white font-semibold hover:opacity-90 transition-all cursor-pointer shrink-0"
              >
                {loading ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
        
        {/* Bottom footer */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Your 100% custom opportunity lineup. Every Monday at 9am.
          </p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:hello@thelineup.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
