import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { HowItWorks } from "@/components/how-it-works"
import { ExampleDrops } from "@/components/example-drops"
import { WhoItsFor } from "@/components/who-its-for"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <SocialProof />
      <HowItWorks />
      <ExampleDrops />
      <WhoItsFor />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
