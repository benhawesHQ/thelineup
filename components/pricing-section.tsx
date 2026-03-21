import { Check, Sparkles, Calendar, Mail, Zap } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const features = [
    "5 personalized opportunities every Monday",
    "Speaking gigs, podcasts, bylines, grants & more",
    "Each opportunity matched to your specific goals",
    "Personalized notes explaining why each one fits",
    "Early access to new features"
  ]

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-secondary/20">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white text-balance">
            SIMPLE<br />
            <span className="gradient-brand-text">PRICING</span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Try it free for 4 weeks. If it's not for you, no hard feelings.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-3xl bg-card border border-border p-8 md:p-10 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />
            
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">First 4 weeks free</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-extrabold text-white">$9</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-8">after your free trial</p>

              {/* Features */}
              <div className="space-y-4 mb-10">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link 
                href="/get-started"
                className="w-full h-14 rounded-full gradient-brand text-white font-semibold text-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Get Your First Lineup Free
              </Link>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                No credit card required to start. Cancel anytime.
              </p>

              {/* Trust signals */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">Every Monday<br />at 9am</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Mail className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">Just 1 email<br />per week</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Zap className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">Cancel in<br />one click</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
