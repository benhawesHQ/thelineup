import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { ChatDemo } from "@/components/chat-demo"
import { ExampleDrops } from "@/components/example-drops"
import { WhoItsFor } from "@/components/who-its-for"
import { PricingSection } from "@/components/pricing-section"

import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { FounderBio } from "@/components/founder-bio"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <HowItWorks />
      <ChatDemo />
      <ExampleDrops />
      <WhoItsFor />
      <PricingSection />
      <FounderBio />
      <CTASection />
      <Footer />
    </main>
  )
}
