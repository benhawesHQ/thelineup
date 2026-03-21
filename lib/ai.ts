import { User, SearchResult, LineupEmail } from "./types"
import { generateText } from "ai"

// Support both old DropEmail and new LineupEmail return type
interface EmailContent {
  opportunities: Array<{
    title: string
    link: string
    reason: string
    type?: string
    deadline?: string
  }>
  body?: string
  greeting?: string
  signoff?: string
}

export async function generateEmail(user: User, opportunities: SearchResult[]): Promise<EmailContent> {
  const firstName = user.name?.split(" ")[0] || "there"
  
  const prompt = `You are helping create a personalized weekly opportunity email for The Lineup.

User Profile:
Name: ${firstName}
Focus: ${user.interests}
Goals: ${user.goals}

Available Opportunities:
${opportunities.map((opp, i) => `${i + 1}. Title: ${opp.title}
   Link: ${opp.link}
   Description: ${opp.snippet}`).join("\n\n")}

TASK:
- Select the top 5 opportunities that are genuinely a strong fit for this person
- Focus on: speaking gigs, podcast features, bylines/publications, grants, residencies, collaborations
- Ignore anything vague, low-quality, or irrelevant

For each selected opportunity, provide:
- Title (clean it up if needed)
- Link
- Type (Speaking, Podcast, Byline, Grant, Collaboration, etc.)
- Deadline if mentioned
- 1 sentence explaining why it fits THIS person's goals

Then write:
1. A short greeting (2-3 sentences, casual and warm, address them by first name)
2. A short signoff (1-2 sentences, encouraging but not cheesy)

Format your response as JSON:
{
  "opportunities": [
    { "title": "...", "link": "...", "type": "...", "deadline": "...", "reason": "..." }
  ],
  "greeting": "...",
  "signoff": "..."
}`

  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.log("[AI] No API key - using fallback content")
    return generateFallbackContent(user, opportunities)
  }

  try {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt
    })

    // Parse the JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
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

function generateFallbackContent(user: User, opportunities: SearchResult[]): EmailContent {
  const firstName = user.name?.split(" ")[0] || "there"
  
  const types = ["Speaking", "Podcast", "Byline", "Grant", "Collaboration"]
  
  return {
    opportunities: opportunities.slice(0, 5).map((opp, i) => ({
      title: opp.title,
      link: opp.link,
      type: types[i % types.length],
      reason: `This looks like a great fit based on your focus in ${user.interests?.split(",")[0] || "your field"}.`
    })),
    greeting: `Hey ${firstName},\n\nHappy Monday. Here are 5 opportunities I found for you this week — all matched to your goals and what you're building.`,
    signoff: `That's your lineup for this week. Go make some noise.\n\n— The Lineup`
  }
}
