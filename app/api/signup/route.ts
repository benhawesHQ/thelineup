import { NextResponse } from "next/server"
import { OnboardingData } from "@/lib/types"
import { getSearchQueries, fetchSearchResults, dedupeResults } from "@/lib/search"
import { generateEmail } from "@/lib/ai"
import { sendEmail } from "@/lib/email"

// In-memory store for demo purposes
// In production, use a database
const users = new Map<string, OnboardingData & { id: string; createdAt: string }>()

export async function POST(request: Request) {
  try {
    const body: OnboardingData = await request.json()
    const { role, visibility, topics, goals, email } = body

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (users.has(email)) {
      return NextResponse.json(
        { error: "You're already signed up! Check your inbox for your Lineup." },
        { status: 400 }
      )
    }

    // Add user
    const user = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString()
    }
    users.set(email, user)
    
    // Generate lineup synchronously so we can return it
    const opportunities = await generateUserLineup(user)
    
    // Send email in background (don't await)
    sendUserEmail(user, opportunities).catch(console.error)

    return NextResponse.json({ 
      success: true, 
      message: "You're in! Here's your first Lineup.",
      opportunities
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

interface Opportunity {
  title: string
  link: string
  type: string
  deadline?: string
  reason: string
}

async function generateUserLineup(user: OnboardingData & { id: string }): Promise<Opportunity[]> {
  // Create a user object compatible with existing functions
  const userForSearch = {
    id: user.id,
    name: user.email.split("@")[0],
    email: user.email,
    location: "US",
    interests: `${user.role}, ${user.visibility}, ${user.topics}`,
    goals: user.goals,
    createdAt: new Date().toISOString(),
    status: "free_trial" as const,
    trialEndsAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
  }

  // Generate search queries based on user profile
  const queries = getSearchQueries(userForSearch)
  
  // Fetch results for each query
  const allResults = []
  for (const query of queries) {
    const results = await fetchSearchResults(query)
    allResults.push(...results)
  }
  
  // Dedupe results
  const uniqueResults = dedupeResults(allResults)
  
  // Generate personalized opportunities with AI
  const emailContent = await generateEmail(userForSearch, uniqueResults)
  
  return emailContent.opportunities || []
}

async function sendUserEmail(user: OnboardingData & { id: string }, opportunities: Opportunity[]) {
  const userForEmail = {
    id: user.id,
    name: user.email.split("@")[0],
    email: user.email,
    location: "US",
    interests: `${user.role}, ${user.visibility}, ${user.topics}`,
    goals: user.goals,
    createdAt: new Date().toISOString(),
    status: "free_trial" as const,
    trialEndsAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  await sendEmail(userForEmail, {
    opportunities,
    greeting: `Hey ${userForEmail.name}!\n\nWelcome to The Lineup! Here are your first 5 personalized opportunities — picked just for you based on what you shared.`,
    signoff: `This is just the beginning! Every Monday at 9am, you'll get a fresh lineup of opportunities matched to your goals.\n\nGo make some noise!\n\n— The Lineup`
  })
}
