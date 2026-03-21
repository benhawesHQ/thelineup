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
  deadline?: string
  reason: string
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
