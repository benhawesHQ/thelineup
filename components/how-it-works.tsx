"use client"

import { MessageCircle, Search, CheckCircle, Mail } from "lucide-react"

const steps = [
  {
    icon: MessageCircle,
    title: "Have a quick chat",
    description: "Tell us about yourself — your work, your goals, the kind of visibility you're after. It's a conversation, not a form.",
    color: "text-orange-400"
  },
  {
    icon: Search,
    title: "We go looking",
    description: "Speaking gigs, podcast guest spots, publications accepting pitches, grants, residencies, collaborations. We dig through it all.",
    color: "text-pink-400"
  },
  {
    icon: CheckCircle,
    title: "We pick the best 5",
    description: "Every opportunity gets matched against your specific goals. Only the ones that actually fit you make the cut.",
    color: "text-purple-400"
  },
  {
    icon: Mail,
    title: "Monday morning, your inbox",
    description: "One email. Five opportunities. Personalized notes explaining why each one matters for you.",
    color: "text-orange-400"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 px-6 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white text-balance">
            HERE'S HOW<br />
            <span className="gradient-brand-text">IT WORKS</span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            You tell us what you're looking for. We do the hunting. You wake up Monday with real options.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group cursor-pointer"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 border border-border hover:border-primary/30 transition-all hover:bg-card/80">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <step.icon className={`w-10 h-10 ${step.color}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
