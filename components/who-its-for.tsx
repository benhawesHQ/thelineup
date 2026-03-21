"use client"

import { Mic, Palette, Briefcase, BookOpen, Camera, Music, Code, Rocket } from "lucide-react"

const personas = [
  { icon: Mic, label: "Speakers", description: "Conferences, panels, keynotes" },
  { icon: Palette, label: "Artists", description: "Grants, residencies, shows" },
  { icon: Music, label: "Musicians", description: "Press, sync, collaborations" },
  { icon: Camera, label: "Creators", description: "Brand deals, media spots" },
  { icon: Code, label: "Builders", description: "Speaking, collabs, press" },
  { icon: BookOpen, label: "Writers", description: "Bylines, fellowships, pitches" },
  { icon: Rocket, label: "Founders", description: "Podcasts, press, grants" },
  { icon: Briefcase, label: "Consultants", description: "Visibility, credibility" }
]

export function WhoItsFor() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white text-balance">
            BUILT FOR<br />
            <span className="gradient-brand-text">AUDIENCE BUILDERS</span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Building an audience isn't just about followers. It's about getting in rooms, on stages, and in front of the right people. The Lineup finds those opportunities for you.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {personas.map((persona, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all text-center hover:bg-card/80 cursor-pointer"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <persona.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-white mb-1">{persona.label}</h3>
              <p className="text-sm text-muted-foreground">{persona.description}</p>
            </div>
          ))}
        </div>
        
        {/* Value props */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer">
            <h3 className="text-5xl font-extrabold gradient-brand-text mb-3">5</h3>
            <p className="text-white font-semibold mb-2">Opportunities Every Monday</p>
            <p className="text-sm text-muted-foreground">No endless scrolling. Just the ones that actually fit what you're building.</p>
          </div>
          
          <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-pink-500/10 to-transparent border border-pink-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
            <h3 className="text-5xl font-extrabold gradient-brand-text mb-3">1</h3>
            <p className="text-white font-semibold mb-2">Email Per Week</p>
            <p className="text-sm text-muted-foreground">Not another newsletter. Something you'll actually look forward to opening.</p>
          </div>
          
          <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer">
            <h3 className="text-5xl font-extrabold gradient-brand-text mb-3">100%</h3>
            <p className="text-white font-semibold mb-2">Custom to You</p>
            <p className="text-sm text-muted-foreground">Every opportunity is handpicked and evaluated toward your specific goals.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
