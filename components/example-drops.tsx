"use client"

import { ArrowUpRight, Mic, Headphones, BookOpen, Award, Users, Clock, Star, Calendar } from "lucide-react"

const exampleOpportunities = [
  {
    type: "Speaking",
    icon: Mic,
    title: "SXSW Panel Speaker Call",
    description: "Open call for speakers on creative entrepreneurship and building in public",
    why: "You mentioned wanting to speak at bigger conferences this year",
    deadline: "April 15",
    tag: "Speaker Fee + Travel",
    gradient: "from-orange-500 to-pink-500"
  },
  {
    type: "Podcast",
    icon: Headphones,
    title: "How I Built This Guest Spot",
    description: "NPR looking for founders with unique origin stories",
    why: "Great fit for the story behind your creative practice",
    deadline: "Rolling",
    tag: "20M Listeners",
    gradient: "from-pink-500 to-purple-500"
  },
  {
    type: "Byline",
    icon: BookOpen,
    title: "Fast Company Contributor",
    description: "Seeking fresh voices on the future of work and creativity",
    why: "Matches your expertise in creative workflows",
    deadline: "May 1",
    tag: "Paid + Exposure",
    gradient: "from-purple-500 to-blue-500"
  },
  {
    type: "Grant",
    icon: Award,
    title: "Creative Capital Award",
    description: "$50,000 for artists working at the intersection of art and technology",
    why: "Perfect for funding that project you've been planning",
    deadline: "April 30",
    tag: "$50K Grant",
    gradient: "from-orange-500 to-amber-500"
  },
  {
    type: "Collaboration",
    icon: Users,
    title: "Patagonia Brand Partnership",
    description: "Seeking creators for environmental storytelling campaign",
    why: "Aligns with your values and audience",
    deadline: "Open",
    tag: "Paid + Reach",
    gradient: "from-green-500 to-emerald-500"
  }
]

export function ExampleDrops() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-secondary/30">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white text-balance">
            WHAT YOUR<br />
            <span className="gradient-brand-text">MONDAY LOOKS LIKE</span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Coffee in hand. Phone buzzes. This lands in your inbox.
          </p>
        </div>
        
        {/* Email mockup */}
        <div className="max-w-3xl mx-auto">
          {/* Email client chrome */}
          <div className="bg-card rounded-t-2xl border border-border border-b-0 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                <span className="font-extrabold text-white text-lg">L</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">The Lineup</p>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground truncate">Your Monday Lineup is Here</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>9:00 AM</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Monday</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Email body */}
          <div className="bg-background rounded-b-2xl border border-border p-6 md:p-8">
            <div className="mb-8 pb-6 border-b border-border">
              <h3 className="text-2xl font-bold text-white mb-3">Hey Maya,</h3>
              <p className="text-muted-foreground leading-relaxed">
                Happy Monday. Here's your lineup for the week — 5 opportunities I pulled together based on your goal of <span className="text-white font-medium">building visibility as a creative strategist</span> and getting in front of <span className="text-white font-medium">more industry audiences</span>.
              </p>
              <p className="text-muted-foreground mt-3">
                Let's get into it:
              </p>
            </div>
            
            <div className="space-y-4">
              {exampleOpportunities.map((opp, index) => (
                <div 
                  key={index}
                  className="group p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all hover:bg-secondary/80 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${opp.gradient} flex items-center justify-center shrink-0`}>
                      <opp.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-primary uppercase tracking-wide">{opp.type}</span>
                        <span className="text-xs text-muted-foreground">Deadline: {opp.deadline}</span>
                      </div>
                      <h4 className="font-semibold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        {opp.title}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                      <p className="text-sm text-primary/80 mt-2 italic">"{opp.why}"</p>
                    </div>
                    
                    <div className="shrink-0">
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">{opp.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-muted-foreground">
                That's your lineup for this week. Click any one to learn more and apply.
              </p>
              <p className="text-muted-foreground mt-3">
                Go make some noise.
              </p>
              <p className="text-white font-medium mt-4">
                — The Lineup
              </p>
            </div>
          </div>
        </div>
        
        {/* Callout */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            <span className="text-white font-medium">Every opportunity includes a personalized note</span> explaining why it made the cut for you.
          </p>
        </div>
      </div>
    </section>
  )
}
