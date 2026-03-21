import { User, SearchResult } from "./types"
import { generateText } from "ai"

// Extended user type with new fields
interface ExtendedUser extends User {
  travel?: string
  visibility?: string
  topics?: string
}

// Email content structure
interface EmailContent {
  opportunities: Array<{
    title: string
    link: string
    type: string
    category: string
    deadline?: string
    description: string
    reason: string
    action: string
    venue?: string
    date?: string
  }>
  body?: string
  greeting?: string
  signoff?: string
}

export async function generateEmail(user: ExtendedUser, opportunities: SearchResult[]): Promise<EmailContent> {
  const firstName = user.name?.split(" ")[0] || "there"
  
  const prompt = `You're curating SPECIFIC, ACTIONABLE opportunities for The Lineup. Not vague suggestions — real things with names, dates, and places.

USER PROFILE:
- Name: ${firstName}
- What they do: ${user.role || user.interests}
- Looking for: ${user.visibility || "visibility opportunities"}
- Topics/expertise: ${user.topics || user.interests}
- Goals: ${user.goals}
- Location: ${user.location || "Not specified"}
- Travel preference: ${user.travel || "Open to travel"}

RAW SEARCH RESULTS:
${opportunities.map((opp, i) => `${i + 1}. "${opp.title}"
   URL: ${opp.link}
   Snippet: ${opp.snippet}`).join("\n\n")}

YOUR JOB:
Extract the 5 MOST SPECIFIC opportunities. You MUST include:
- Exact event/organization names (e.g., "Jersey City Comedy Festival" not "comedy festival")
- Specific venues and cities when mentioned (e.g., "at Fordham Law" or "Javits Center")
- Actual dates or deadlines (e.g., "June 11-13", "Deadline: April 10", "Rolling - Act fast")
- What makes it unique (e.g., "Industry judges include Comedy Central" or "2,000+ NYC entrepreneurs")

REJECT opportunities that are:
- Generic "how to" articles or listicles
- Facebook groups or community forums
- Vague "opportunities in [field]" posts
- Job boards without specific listings
- Outdated (more than 2 months old)

For each opportunity, create:
1. **title**: Specific event/opportunity name with date/location if available (e.g., "NYC Small Business Expo - May 7 at Javits Center")
2. **category**: ALL CAPS topic tag (e.g., "TECH & STARTUPS", "COMEDY & MUSIC", "HEALTH & WELLNESS", "BUSINESS", "CREATIVE ARTS")
3. **type**: The opportunity type (Speaking, Podcast, Byline, Grant, Pitch, Fellowship, Brand, Summit)
4. **description**: 1-2 sentences with SPECIFIC details from the listing (judges, audience size, what they're looking for)
5. **deadline**: Exact date or urgency ("April 10", "Rolling - Act fast", "Email this week")
6. **venue**: Specific location if mentioned
7. **date**: Event date if mentioned
8. **action**: CTA verb ("Submit", "Apply", "Pitch", "Reach out", "Draft pitch")
9. **reason**: One conversational sentence about why it fits THIS person

EXAMPLE OUTPUT:
{
  "opportunities": [
    {
      "title": "Jersey City Comedy Festival - Submissions Open Now",
      "link": "https://...",
      "type": "Speaking",
      "category": "COMEDY & MUSIC",
      "description": "JCCF is accepting stand-up submissions for June 11-13. Industry judges include Comedy Central, Stand-Up New York, and Catch a Rising Star.",
      "deadline": "Rolling - Act fast",
      "venue": "Jersey City",
      "date": "June 11-13",
      "action": "Submit",
      "reason": "You mentioned comedy — this could get you in front of industry bookers."
    }
  ],
  "greeting": "Hey ${firstName}! Found some specific opportunities that match what you're building...",
  "signoff": "Go get 'em. — The Lineup"
}

RESPOND IN JSON ONLY:`

  try {
    // Use Vercel AI Gateway - no API key needed in v0
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt
    })

    // Parse the JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[AI] No JSON found in response:", result.text.substring(0, 200))
      return generateFallbackContent(user, opportunities)
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      opportunities: parsed.opportunities || [],
      greeting: parsed.greeting || "",
      signoff: parsed.signoff || ""
    }
  } catch (error) {
    console.error("[AI] Generation error:", error)
    return generateFallbackContent(user, opportunities)
  }
}

function generateFallbackContent(user: ExtendedUser, opportunities: SearchResult[]): EmailContent {
  const firstName = user.name?.split(" ")[0] || "there"
  const mainInterest = user.topics || user.interests?.split(",")[0] || "your expertise"
  
  // Infer type and category from content
  const inferDetails = (opp: SearchResult): { type: string; category: string; action: string } => {
    const text = (opp.title + " " + opp.snippet).toLowerCase()
    if (text.includes("speak") || text.includes("conference") || text.includes("summit")) {
      return { type: "Speaking", category: "BUSINESS & EVENTS", action: "Apply" }
    }
    if (text.includes("podcast") || text.includes("guest")) {
      return { type: "Podcast", category: "MEDIA", action: "Pitch" }
    }
    if (text.includes("grant") || text.includes("funding") || text.includes("fellowship")) {
      return { type: "Grant", category: "FUNDING", action: "Apply" }
    }
    if (text.includes("publish") || text.includes("submit") || text.includes("contributor")) {
      return { type: "Byline", category: "PUBLISHING", action: "Submit" }
    }
    if (text.includes("brand") || text.includes("ambassador") || text.includes("partner")) {
      return { type: "Brand", category: "PARTNERSHIPS", action: "Reach out" }
    }
    return { type: "Opportunity", category: "GENERAL", action: "Check it out" }
  }
  
  return {
    opportunities: opportunities.slice(0, 5).map((opp) => {
      const details = inferDetails(opp)
      return {
        title: opp.title,
        link: opp.link,
        type: details.type,
        category: details.category,
        description: opp.snippet.slice(0, 150) + (opp.snippet.length > 150 ? "..." : ""),
        action: details.action,
        reason: `This came up when I searched for ${mainInterest} opportunities.`
      }
    }),
    greeting: `Hey ${firstName}!\n\nHere are 5 opportunities I found that match what you're building.`,
    signoff: `Go get 'em. — The Lineup`
  }
}
