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
  
  // Business types - be VERY specific, order matters (longer phrases first)
  const businessTypes = [
    // Events & Entertainment
    "photo booth", "photobooth", "event planning", "event planner", "wedding planner",
    "dj", "disc jockey", "catering", "florist", "videography", "videographer", 
    "photography", "photographer", "event production", "party planning",
    // Tech & Startups  
    "tech startup", "saas", "software", "app developer", "web developer",
    "e-commerce", "ecommerce", "ai", "artificial intelligence", "machine learning",
    "blockchain", "crypto", "fintech", "edtech", "healthtech",
    // Professional Services
    "consulting", "consultant", "coaching", "coach", "trainer", "mentor",
    "real estate", "realtor", "attorney", "lawyer", "accountant", "financial advisor",
    // Creative & Media
    "content creator", "content creation", "influencer", "youtuber", "podcaster",
    "author", "writer", "journalist", "blogger", "graphic designer", "designer",
    "artist", "musician", "singer", "actor", "comedian", "stand-up", "standup",
    // Health & Wellness
    "fitness", "personal trainer", "yoga", "nutritionist", "therapist", 
    "wellness", "health coach", "life coach", "mental health",
    // Other Industries
    "fashion", "beauty", "makeup artist", "hair stylist", "chef", "restaurant",
    "nonprofit", "non-profit", "social enterprise", "sustainability", "climate"
  ]
  
  // Industry/topic keywords
  const industries = [
    "entrepreneurship", "entrepreneur", "small business", "startup", "founder",
    "leadership", "management", "innovation", "technology", "tech",
    "creative", "creativity", "entertainment", "media", "marketing", "pr",
    "public relations", "branding", "sales", "business development",
    "sports", "athletics", "arts", "culture", "food", "culinary", "travel",
    "parenting", "motherhood", "fatherhood", "relationships", "dating",
    "personal development", "self help", "motivation", "inspiration",
    "diversity", "dei", "inclusion", "women in business", "black entrepreneur"
  ]
  
  // Specific goals/targets
  const goalTerms = [
    "tedx", "ted talk", "ted speaker", "keynote", "keynote speaker",
    "book deal", "publish a book", "author", "forbes", "entrepreneur magazine",
    "inc magazine", "inc 500", "fast company", "new york times", "wall street journal",
    "speaking circuit", "paid speaker", "professional speaker", "thought leader",
    "industry expert", "brand ambassador", "brand deal", "sponsorship"
  ]
  
  // Check for matches - longer phrases first to avoid partial matches
  const allTerms = [...businessTypes, ...industries, ...goalTerms]
    .sort((a, b) => b.length - a.length) // Sort by length descending
  
  allTerms.forEach(term => {
    if (lower.includes(term) && !keywords.some(k => k.includes(term) || term.includes(k))) {
      keywords.push(term)
    }
  })
  
  // Also extract any quoted phrases they might use
  const quotedPhrases = text.match(/"([^"]+)"/g)
  if (quotedPhrases) {
    quotedPhrases.forEach(phrase => {
      keywords.push(phrase.replace(/"/g, '').toLowerCase())
    })
  }
  
  // Extract capitalized multi-word phrases (likely business names or specific things)
  const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g)
  if (capitalizedPhrases) {
    capitalizedPhrases.forEach(phrase => {
      if (phrase.length > 5 && !['The', 'And', 'For'].includes(phrase)) {
        keywords.push(phrase.toLowerCase())
      }
    })
  }
  
  return [...new Set(keywords)].slice(0, 8) // Limit to top 8 keywords
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
  return uniqueQueries.slice(0, 10)
}

// Single search query
async function fetchSingleQuery(query: string, apiKey: string): Promise<SearchResult[]> {
  const url = new URL("https://serpapi.com/search")
  url.searchParams.set("q", query)
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("engine", "google")
  url.searchParams.set("num", "5") // Only need 5 per query

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    console.error(`SerpAPI error for "${query}":`, response.status)
    return []
  }
  
  const data = await response.json()
  
  return (data.organic_results || []).map((result: { title?: string; link?: string; snippet?: string }) => ({
    title: result.title || "",
    link: result.link || "",
    snippet: result.snippet || ""
  }))
}

// Run multiple searches in parallel for speed
export async function fetchSearchResults(queries: string[]): Promise<SearchResult[]> {
  const apiKey = process.env.SERP_API_KEY
  
  if (!apiKey) {
    throw new Error("SERP_API_KEY is not configured. Please add it in Settings > Vars.")
  }
  
  // Run all queries in parallel
  const results = await Promise.all(
    queries.slice(0, 5).map(query => fetchSingleQuery(query, apiKey))
  )
  
  // Flatten and dedupe
  const allResults = results.flat()
  return dedupeResults(allResults)
}

export function dedupeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  return results.filter(result => {
    // Skip if no link or already seen
    if (!result.link || seen.has(result.link)) return false
    
    // Skip generic/bad results
    const lower = (result.title + result.snippet).toLowerCase()
    const skipPatterns = [
      "facebook.com/groups",
      "linkedin.com/posts",
      "reddit.com",
      "quora.com",
      "how to become",
      "tips for",
      "10 ways to",
      "complete guide"
    ]
    if (skipPatterns.some(p => lower.includes(p))) return false
    
    seen.add(result.link)
    return true
  })
}
