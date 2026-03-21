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
