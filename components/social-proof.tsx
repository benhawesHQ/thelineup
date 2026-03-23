"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "Landed my first paid speaking gig within 3 weeks of signing up.",
    name: "Sarah M.",
    role: "Business Coach"
  },
  {
    quote: "Finally got on a podcast that actually reached my target audience.",
    name: "Marcus T.",
    role: "Tech Founder"
  },
  {
    quote: "The opportunities are so specific. Not generic stuff I could find myself.",
    name: "Jessica L.",
    role: "Author & Speaker"
  }
]

export function SocialProof() {
  return (
    <section className="relative py-16 px-6 border-y border-border/50 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        {/* Stats row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold gradient-brand-text">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Opportunities sent</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold gradient-brand-text">87%</div>
            <div className="text-sm text-muted-foreground mt-1">Say they're a fit</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-border" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-4xl md:text-5xl font-extrabold text-white">
              4.9
              <Star className="w-8 h-8 text-primary fill-primary" />
            </div>
            <div className="text-sm text-muted-foreground mt-1">Average rating</div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-white font-medium mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
