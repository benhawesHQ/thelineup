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
    reason: string
    type?: string
    deadline?: string
  }>
  body?: string
  greeting?: string
  signoff?: string
}

export async function generateEmail(user: ExtendedUser, opportunities: SearchResult[]): Promise<EmailContent> {
  const firstName = user.name?.split(" ")[0] || "there"
  
  const prompt = `You're the voice of The Lineup — a friendly, encouraging assistant who helps multi-hyphenates find amazing opportunities.

USER PROFILE:
Name: ${firstName}
What they do: ${user.role || user.interests}
Looking for: ${user.visibility || "visibility opportunities"}
Topics/expertise: ${user.topics || user.interests}
Big goals: ${user.goals}
Location: ${user.location || "Not specified"}
Travel: ${user.travel || "Open to travel"}

RAW SEARCH RESULTS:
${opportunities.map((opp, i) => `${i + 1}. "${opp.title}"
   URL: ${opp.link}
   Description: ${opp.snippet}`).join("\n\n")}

YOUR JOB:
Pick the 5 BEST opportunities from the search results that actually fit ${firstName}. Be picky — only include things that are:
- Real opportunities (speaking gigs, podcast guest spots, publications accepting pitches, grants, brand collabs, etc.)
- Relevant to what they do and their goals
- Actually worth their time

For each opportunity, write a CONVERSATIONAL reason (1-2 sentences) explaining why YOU think it's a good fit for THEM specifically. Sound like a friend who found something exciting, not a robot. Reference their actual goals and interests.

Examples of good reasons:
- "You mentioned wanting to get on more podcasts about tech — this one's specifically looking for founders to talk about AI, which is right in your wheelhouse."
- "Since you're building toward a TEDx talk, this speaker submission could be great practice and visibility."
- "This grant is literally for creatives doing exactly what you described — the $10k could fund your next project."

Also write:
1. A warm, casual greeting (2-3 sentences) — like a text from a friend who's excited to share good news. Use their name.
2. A short signoff (1-2 sentences) — encouraging but genuine, not corporate.

RESPOND IN JSON ONLY:
{
  "opportunities": [
    { 
      "title": "Clean, readable title", 
      "link": "exact URL from results", 
      "type": "Speaking|Podcast|Byline|Grant|Brand|Fellowship|Other", 
      "deadline": "if mentioned, otherwise null",
      "reason": "Conversational reason why this fits them"
    }
  ],
  "greeting": "Your warm greeting...",
  "signoff": "Your signoff..."
}`

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
  
  // Try to infer types from titles/snippets
  const inferType = (opp: SearchResult): string => {
    const text = (opp.title + " " + opp.snippet).toLowerCase()
    if (text.includes("speak") || text.includes("conference") || text.includes("summit")) return "Speaking"
    if (text.includes("podcast") || text.includes("guest")) return "Podcast"
    if (text.includes("grant") || text.includes("funding") || text.includes("fellowship")) return "Grant"
    if (text.includes("publish") || text.includes("submit") || text.includes("contributor")) return "Byline"
    if (text.includes("brand") || text.includes("ambassador") || text.includes("partner")) return "Brand"
    return "Opportunity"
  }
  
  return {
    opportunities: opportunities.slice(0, 5).map((opp) => ({
      title: opp.title,
      link: opp.link,
      type: inferType(opp),
      reason: `This came up when I searched for ${mainInterest} opportunities — looks like it could be a solid fit for what you're building toward.`
    })),
    greeting: `Hey ${firstName}!\n\nI just finished digging through a ton of opportunities and pulled out 5 that I think are actually worth your time. These are matched to what you told me about your goals in ${mainInterest}.`,
    signoff: `That's your lineup for this week. Let me know how it goes — I'm always looking for the next one for you.\n\n— The Lineup`
  }
}
