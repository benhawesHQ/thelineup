import { User, SearchResult } from "./types"

interface ExtendedUser extends User {
  travel?: string
  topics?: string
  visibility?: string
  role?: string
}

// Extract specific keywords from user's free-text responses
export function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  const lower = text.toLowerCase()
  
  // Business types - be specific
  const businessTypes = [
    "photo booth", "photography", "videography", "event planning", "catering",
    "real estate", "tech startup", "saas", "e-commerce", "consulting",
    "coaching", "fitness", "wellness", "health", "beauty", "fashion",
    "music", "podcast", "content creation", "marketing", "pr", "design",
    "architecture", "law", "finance", "investing", "crypto", "ai", "machine learning",
    "education", "nonprofit", "social impact", "sustainability", "climate"
  ]
  
  // Industry-specific terms
  const industries = [
    "entrepreneurship", "leadership", "innovation", "technology", "creative",
    "entertainment", "media", "sports", "arts", "culture", "food", "travel",
    "parenting", "relationships", "mental health", "personal development"
  ]
  
  // Specific goals
  const goalTerms = [
    "tedx", "ted talk", "keynote", "book deal", "forbes", "entrepreneur magazine",
    "inc magazine", "fast company", "new york times", "wall street journal",
    "speaking circuit", "thought leader", "industry expert", "brand ambassador"
  ]
  
  // Check for matches
  businessTypes.forEach(term => {
    if (lower.includes(term)) keywords.push(term)
  })
  
  industries.forEach(term => {
    if (lower.includes(term)) keywords.push(term)
  })
  
  goalTerms.forEach(term => {
    if (lower.includes(term)) keywords.push(term)
  })
  
  return [...new Set(keywords)]
}

export function getSearchQueries(user: ExtendedUser): string[] {
  const { location, interests, goals, travel } = user
  
  // Extract specific keywords from their responses
  const topicKeywords = extractKeywords(user.topics || interests || "")
  const goalKeywords = extractKeywords(goals || "")
  const allKeywords = [...new Set([...topicKeywords, ...goalKeywords])]
  
  // Parse visibility types
  const visibilityTypes = (user.visibility || interests || "").toLowerCase()
  const wantsSpeaking = visibilityTypes.includes("speaking")
  const wantsPodcasts = visibilityTypes.includes("podcast")
  const wantsPublishing = visibilityTypes.includes("publish")
  const wantsBrand = visibilityTypes.includes("brand")
  const wantsGrants = visibilityTypes.includes("grant") || visibilityTypes.includes("funding")
  
  const queries: string[] = []
  const currentYear = new Date().getFullYear()
  
  // Location handling
  const city = location || "New York"
  const isLocalOnly = travel?.includes("local") || travel?.includes("Online")
  
  // SPECIFIC queries based on extracted keywords
  allKeywords.slice(0, 3).forEach(keyword => {
    if (wantsSpeaking) {
      // Very specific conference searches
      queries.push(`"call for speakers" "${keyword}" ${currentYear}`)
      queries.push(`${keyword} conference speaker applications ${currentYear}`)
      queries.push(`"seeking speakers" ${keyword} summit ${currentYear}`)
    }
    
    if (wantsPodcasts) {
      queries.push(`${keyword} podcast "looking for guests" ${currentYear}`)
      queries.push(`"be a guest" ${keyword} podcast`)
    }
    
    if (wantsPublishing) {
      queries.push(`${keyword} "contributor guidelines" "pitch us"`)
      queries.push(`${keyword} publication "submit" "guest post"`)
    }
    
    if (wantsBrand) {
      queries.push(`${keyword} "brand ambassador" application ${currentYear}`)
      queries.push(`${keyword} sponsorship opportunities creators`)
    }
    
    if (wantsGrants) {
      queries.push(`grants "${keyword}" ${currentYear} "applications open"`)
      queries.push(`${keyword} fellowship program ${currentYear}`)
    }
  })
  
  // Location-specific queries
  if (!isLocalOnly && city) {
    queries.push(`"call for speakers" ${city} ${currentYear}`)
    queries.push(`${city} conferences accepting speakers ${currentYear}`)
  }
  
  // TEDx specific if mentioned in goals
  if (goals?.toLowerCase().includes("ted") || goals?.toLowerCase().includes("tedx")) {
    queries.push(`TEDx "open call" speakers ${currentYear}`)
    queries.push(`TEDx auditions applications ${city} ${currentYear}`)
  }
  
  // University/academic speaking if relevant
  if (allKeywords.some(k => ["entrepreneurship", "leadership", "tech", "ai", "innovation"].includes(k))) {
    queries.push(`university "guest speaker" ${allKeywords[0] || "entrepreneurship"} ${currentYear}`)
    queries.push(`"looking for speakers" college ${allKeywords[0] || ""} ${currentYear}`)
  }
  
  // Dedupe and limit
  const uniqueQueries = [...new Set(queries.filter(q => q.length > 10))]
  return uniqueQueries.slice(0, 10) // Use up to 10 queries for variety
}

export async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERP_API_KEY
  
  if (!apiKey) {
    console.warn("SERP_API_KEY not set, using mock data")
    return getMockResults(query)
  }
  
  try {
    const url = new URL("https://serpapi.com/search")
    url.searchParams.set("q", query)
    url.searchParams.set("api_key", apiKey)
    url.searchParams.set("engine", "google")
    url.searchParams.set("num", "10")
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error("SerpAPI error:", response.status)
      return getMockResults(query)
    }
    
    const data = await response.json()
    
    return (data.organic_results || []).map((result: { title?: string; link?: string; snippet?: string }) => ({
      title: result.title || "",
      link: result.link || "",
      snippet: result.snippet || ""
    }))
  } catch (error) {
    console.error("Search error:", error)
    return getMockResults(query)
  }
}

export function dedupeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  return results.filter(result => {
    if (seen.has(result.link)) {
      return false
    }
    seen.add(result.link)
    return true
  })
}

function getMockResults(query: string): SearchResult[] {
  // More realistic mock results showing the SPECIFIC format we want
  const mockData: SearchResult[] = [
    {
      title: "Columbia University Entrepreneurship Summit - Call for Speakers",
      link: "https://entrepreneurship.columbia.edu/summit-speakers",
      snippet: "We're seeking 15-minute TED-style talks from entrepreneurs and founders. Topic: Innovation in 2026. Application deadline: April 15. Past speakers include founders from Stripe and Notion."
    },
    {
      title: "SXSW 2026 PanelPicker - Submit Your Session",
      link: "https://panelpicker.sxsw.com/2026",
      snippet: "SXSW is accepting session proposals for 2026. Looking for speakers on AI, entrepreneurship, creativity, and emerging tech. Community voting opens May 1."
    },
    {
      title: "TEDxBrooklyn Open Call for Speakers - Theme: Reinvention",
      link: "https://tedxbrooklyn.com/speak",
      snippet: "TEDxBrooklyn is accepting speaker applications for our October 2026 event. We're looking for ideas worth spreading on reinvention, second acts, and transformation. 8-minute talks."
    },
    {
      title: "How I Built This Podcast - Guest Submission Form",
      link: "https://npr.org/podcasts/hibt-guest-submit",
      snippet: "NPR's How I Built This is looking for founder stories. Have you built something from nothing? We want to hear your entrepreneurial journey. Must have $1M+ revenue or significant impact."
    },
    {
      title: "Entrepreneur Magazine - Contributor Guidelines",
      link: "https://entrepreneur.com/write-for-us",
      snippet: "Pitch us your best business advice. We publish thought leadership from founders, executives, and industry experts. Topics: startups, marketing, leadership, finance. Pay: $500-1500/article."
    },
    {
      title: "WeWork Creator Awards - $1M in Grants",
      link: "https://wework.com/creator-awards",
      snippet: "The Creator Awards celebrates entrepreneurs, artists, and community builders. Grand prize: $360,000. Applications open through June 30. Open to small businesses under 5 years old."
    },
    {
      title: "NYC Small Business Expo - Booth & Speaking Opportunities",
      link: "https://nycsmallbusinessexpo.com/exhibit",
      snippet: "May 7 at Javits Center. 2,000+ NYC entrepreneurs expected. Apply for a 20-minute breakout session or booth space. Great for B2B service providers and consultants."
    },
    {
      title: "Photo Booth Expo - Industry Speaker Track",
      link: "https://photoboothexpo.com/speak-2026",
      snippet: "The largest photo booth industry event. We're seeking speakers on business growth, marketing, and tech innovation in the events industry. March 15-17 in Las Vegas."
    },
    {
      title: "Podcast Guest Matching - Entrepreneurs & Founders",
      link: "https://podmatch.com/guest-entrepreneurs",
      snippet: "Get matched with 500+ podcasts looking for entrepreneur guests. Topics include startups, business growth, side hustles, and leadership. Free to join."
    },
    {
      title: "Fast Company Innovation Festival - Call for Innovators",
      link: "https://fastcompany.com/innovation-festival",
      snippet: "Present your innovation at Fast Company's annual festival in NYC. Seeking founders, creators, and innovators reshaping industries. Application deadline: July 1."
    }
  ]
  
  // Return results that match the query keywords
  const keywords = query.toLowerCase().split(" ").filter(k => k.length > 3)
  const matches = mockData.filter(result => 
    keywords.some(keyword => 
      result.title.toLowerCase().includes(keyword) || 
      result.snippet.toLowerCase().includes(keyword)
    )
  )
  
  // If no matches, return a random selection
  if (matches.length === 0) {
    return mockData.slice(0, 5)
  }
  
  return matches.slice(0, 5)
}
