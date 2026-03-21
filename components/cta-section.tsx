import { ArrowRight, Calendar, Sparkles } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Logo size="md" />
        
        <h2 className="mt-12 text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white text-balance">
          YOUR NEXT<br />
          <span className="gradient-brand-text">BIG OPPORTUNITY</span><br />
          IS OUT THERE
        </h2>
        
        <p className="mt-8 text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
          Stop missing deadlines and stumbling on opportunities too late. Start your week with 5 visibility-building chances picked just for you.
        </p>
        
        <Link
          href="/get-started"
          className="mt-12 h-16 px-12 rounded-full gradient-brand text-white font-semibold text-xl hover:opacity-90 transition-all hover:scale-[1.02] shadow-2xl shadow-primary/20 group cursor-pointer flex items-center gap-3 mx-auto w-fit"
        >
          <Sparkles className="w-5 h-5" />
          Get Your First Lineup
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="mt-4 text-sm text-muted-foreground">
          First 4 weeks free. Then $9/month if you love it.
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>First Lineup arrives this Monday at 9am</span>
        </div>
      </div>
    </section>
  )
}
