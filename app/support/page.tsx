"use client"

import { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Send, 
  ChevronDown, 
  Mail, 
  HelpCircle,
  CreditCard,
  Calendar,
  Target,
  Loader2,
  CheckCircle
} from "lucide-react"

const FAQS = [
  {
    category: "Getting Started",
    icon: HelpCircle,
    questions: [
      {
        q: "How does The Lineup work?",
        a: "Every Monday at 9am, you'll receive a personalized email with 5 hand-picked opportunities matched to your goals, expertise, and what you're building. We search the internet for speaking gigs, podcast guest spots, publishing opportunities, grants, and more — then use AI to curate the best fits specifically for you."
      },
      {
        q: "What kind of opportunities will I get?",
        a: "Based on what you tell us, you might receive: calls for speakers, podcast interview requests, publications looking for contributors, grants and fellowships, brand partnership opportunities, competitions, and more. Everything is tailored to your unique profile."
      },
      {
        q: "How do you find these opportunities?",
        a: "We use a combination of real-time web search and AI curation. Our system searches for opportunities matching your expertise and goals, then our AI reviews each one to make sure it's actually worth your time before it hits your inbox."
      }
    ]
  },
  {
    category: "Billing & Subscription",
    icon: CreditCard,
    questions: [
      {
        q: "How much does The Lineup cost?",
        a: "After your 4-week free trial, The Lineup is $9/month. You can cancel anytime — no commitments, no contracts."
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel anytime by emailing us at benjhawes@gmail.com with your account email. We'll process your cancellation right away — no hoops to jump through."
      },
      {
        q: "Will I be charged during the free trial?",
        a: "Nope! Your first 4 weeks are completely free. We'll send you a reminder before your trial ends so you can decide if you want to continue."
      }
    ]
  },
  {
    category: "Your Lineup",
    icon: Calendar,
    questions: [
      {
        q: "When do I receive my lineup?",
        a: "Every Monday at 9am in your timezone. We believe in starting your week with momentum and fresh opportunities to pursue."
      },
      {
        q: "Can I change my preferences?",
        a: "Absolutely! Just reply to any lineup email or reach out to us, and we'll update your profile. We're always refining to make sure you get the most relevant opportunities."
      },
      {
        q: "What if an opportunity isn't relevant to me?",
        a: "Let us know! Reply to the email and tell us what didn't fit. This helps our AI learn and improve your future lineups."
      }
    ]
  },
  {
    category: "Results",
    icon: Target,
    questions: [
      {
        q: "What results can I expect?",
        a: "That depends on you! Our members have landed TEDx talks, been featured on top podcasts, gotten published in major outlets, and secured grants. The opportunities are real — it's up to you to pursue them."
      },
      {
        q: "Do you guarantee I'll get selected for opportunities?",
        a: "We can't guarantee selections — that's up to the opportunity providers. What we do guarantee is that you'll receive relevant, high-quality opportunities every week that are worth applying to."
      }
    ]
  }
]

export default function SupportPage() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields")
      return
    }

    setSending(true)
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setSent(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setError("Something went wrong. Please try emailing us directly.")
      }
    } catch {
      setError("Something went wrong. Please try emailing us directly.")
    }
    
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How can we help?
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers below or reach out directly — we're here for you.
            </p>
          </div>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-white mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-8">
              {FAQS.map((category) => (
                <div key={category.category} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-secondary/30">
                    <category.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-white">{category.category}</h3>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {category.questions.map((faq, idx) => {
                      const itemId = `${category.category}-${idx}`
                      const isOpen = openItems.includes(itemId)
                      
                      return (
                        <div key={idx}>
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors cursor-pointer"
                          >
                            <span className="font-medium text-white pr-4">{faq.q}</span>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form Section */}
          <section>
            <div className="bg-card rounded-2xl border border-border p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Still have questions?</h2>
                  <p className="text-muted-foreground">Send us a message and we'll get back to you ASAP.</p>
                </div>
              </div>

              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thanks for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Your name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jane Doe"
                        className="h-12 bg-secondary border-border text-white placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Email address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jane@example.com"
                        className="h-12 bg-secondary border-border text-white placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What's this about?"
                      className="h-12 bg-secondary border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      className="bg-secondary border-border text-white placeholder:text-muted-foreground resize-none"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-destructive text-sm">{error}</p>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Or email us directly at{" "}
                      <a href="mailto:benjhawes@gmail.com" className="text-primary hover:underline">
                        benjhawes@gmail.com
                      </a>
                    </p>
                    <Button
                      type="submit"
                      disabled={sending}
                      className="h-12 px-8 gradient-brand text-white font-semibold cursor-pointer w-full sm:w-auto"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send message
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
