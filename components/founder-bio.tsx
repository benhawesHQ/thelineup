import Image from "next/image"
import { Mic, Building2, Music, MessageSquare } from "lucide-react"

export function FounderBio() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_50%_50%] from-primary/5 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-12 text-center">
          About the Founder
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Photo */}
          <div className="flex-shrink-0 relative">
            <div className="w-56 h-64 md:w-64 md:h-72 rounded-3xl overflow-hidden border border-border relative shadow-lg">
              <Image
                src="/images/ben-hawes.jpg"
                alt="Ben Hawes"
                fill
                className="object-cover"
              />
            </div>
            {/* Accent ring */}
            <div className="absolute -inset-1 rounded-3xl gradient-brand opacity-20 -z-10 blur-sm" />
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
              Ben Hawes
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 text-pretty">
              Speaker, business owner, comedian, and musician. Ben has spent years hunting for the right stages and the right people. The Drop exists because he wanted to build something smarter — a more human way to discover real opportunities and connect with the people who matter.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {[
                { icon: Mic, label: "Speaker" },
                { icon: Building2, label: "Business Owner" },
                { icon: MessageSquare, label: "Comedian" },
                { icon: Music, label: "Musician" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm text-foreground font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
