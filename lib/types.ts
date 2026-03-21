export interface User {
  id: string
  name: string
  email: string
  role: string
  visibility: string
  topics: string
  goals: string
  city: string
  travel: string
  createdAt: string
  // Subscription fields
  status: "free_trial" | "active" | "cancelled" | "expired"
  trialEndsAt: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface SearchResult {
  title: string
  link: string
  snippet: string
}

export interface Opportunity {
  title: string
  link: string
  type: string
  category: string // e.g., "COMEDY & MUSIC", "TECH & STARTUPS", "HEALTH & WELLNESS"
  deadline?: string
  description: string // Specific details about the opportunity
  reason: string // Why it's a fit
  action: string // "Submit", "Apply", "Pitch", "Reach out"
  venue?: string // Location/venue if applicable
  date?: string // Event date if applicable
}

export interface LineupEmail {
  opportunities: Opportunity[]
  greeting: string
  signoff: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface OnboardingData {
  name: string
  role: string
  visibility: string
  topics: string
  goals: string
  city: string
  travel: string
  email: string
}
