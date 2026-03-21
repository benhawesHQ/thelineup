import { User, SearchResult } from "./types"

interface ExtendedUser extends User {
  travel?: string
}

export function getSearchQueries(user: ExtendedUser): string[] {
  const { location, interests, goals, travel } = user
  const interestList = interests.split(",").map(i => i.trim()).filter(Boolean)
  
  // Parse visibility types from interests (they're combined)
  const visibilityKeywords = ["speaking", "podcast", "published", "brand", "grants", "funding"]
  const topics = interestList.filter(i => !visibilityKeywords.some(v => i.toLowerCase().includes(v)))
  const visibility = interestList.filter(i => visibilityKeywords.some(v => i.toLowerCase().includes(v)))
  
  const queries: string[] = []
  const currentYear = new Date().getFullYear()
  
  // Location modifier based on travel preference
  const locationMod = travel?.includes("Online") ? "virtual OR remote OR online" : 
                      travel?.includes("country") ? `${location} OR USA OR "United States"` : 
                      ""
  
  // Speaking opportunities
  if (visibility.some(v => v.toLowerCase().includes("speaking")) || interests.toLowerCase().includes("speaker")) {
    queries.push(`call for speakers ${currentYear} ${topics.slice(0, 2).join(" ")} ${locationMod}`.trim())
    queries.push(`speaking opportunities conferences ${topics[0] || ""} ${currentYear}`.trim())
    queries.push(`TEDx auditions open ${currentYear} ${location}`.trim())
  }
  
  // Podcast opportunities
  if (visibility.some(v => v.toLowerCase().includes("podcast")) || interests.toLowerCase().includes("podcast")) {
    queries.push(`podcasts looking for guests ${topics.slice(0, 2).join(" ")} ${currentYear}`.trim())
    queries.push(`be a podcast guest ${topics[0] || ""} submit`.trim())
  }
  
  // Publishing opportunities  
  if (visibility.some(v => v.toLowerCase().includes("publish")) || interests.toLowerCase().includes("writer")) {
    queries.push(`call for submissions ${topics[0] || ""} ${currentYear}`.trim())
    queries.push(`guest post opportunities ${topics.slice(0, 2).join(" ")}`.trim())
    queries.push(`contributor guidelines ${topics[0] || ""} publications`.trim())
  }
  
  // Brand partnerships
  if (visibility.some(v => v.toLowerCase().includes("brand"))) {
    queries.push(`brand ambassador programs ${topics[0] || ""} ${currentYear}`.trim())
    queries.push(`influencer partnerships ${topics.slice(0, 2).join(" ")} apply`.trim())
  }
  
  // Grants and funding
  if (visibility.some(v => v.toLowerCase().includes("grant") || v.toLowerCase().includes("funding"))) {
    queries.push(`grants for ${topics[0] || "creatives"} ${currentYear} applications open`.trim())
    queries.push(`fellowship programs ${topics.slice(0, 2).join(" ")} ${currentYear}`.trim())
    queries.push(`funding opportunities ${topics[0] || ""} artists creators`.trim())
  }
  
  // Add goal-specific searches
  if (goals) {
    queries.push(`${goals} opportunities apply ${currentYear}`.trim())
  }
  
  // Add topic-specific opportunities
  topics.slice(0, 2).forEach(topic => {
    queries.push(`${topic} opportunities ${currentYear} apply now`.trim())
  })
  
  // Dedupe and limit
  const uniqueQueries = [...new Set(queries.filter(q => q.length > 10))]
  return uniqueQueries.slice(0, 8) // Use up to 8 queries for variety
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
  // Mock results for development/demo
  const mockData: SearchResult[] = [
    {
      title: "Junior Designer Position - Creative Agency",
      link: "https://example.com/job-1",
      snippet: "Looking for a creative designer to join our growing team. Remote-friendly, competitive salary."
    },
    {
      title: "Tech Innovation Grant - $50,000",
      link: "https://example.com/grant-1",
      snippet: "Apply for our annual innovation grant. Open to projects in tech, design, and sustainability."
    },
    {
      title: "Marketing Fellowship Program 2024",
      link: "https://example.com/fellowship-1",
      snippet: "6-month paid fellowship for emerging marketers. Mentorship and networking included."
    },
    {
      title: "Startup Accelerator Applications Open",
      link: "https://example.com/accelerator-1",
      snippet: "Join our accelerator program. $100k investment, 3 months of intensive mentorship."
    },
    {
      title: "Remote Content Writer - SaaS Company",
      link: "https://example.com/job-2",
      snippet: "We're hiring content writers who can craft compelling stories. Work from anywhere."
    },
    {
      title: "Creative Arts Scholarship",
      link: "https://example.com/scholarship-1",
      snippet: "Full scholarship for creative professionals. Covers tuition, materials, and living expenses."
    },
    {
      title: "Product Manager Opportunity",
      link: "https://example.com/job-3",
      snippet: "Join a fast-growing startup as Product Manager. Lead innovative projects."
    },
    {
      title: "Social Impact Grant Program",
      link: "https://example.com/grant-2",
      snippet: "Funding for projects that create positive social change. Up to $25,000 available."
    }
  ]
  
  // Return results that match the query keywords
  const keywords = query.toLowerCase().split(" ")
  return mockData.filter(result => 
    keywords.some(keyword => 
      result.title.toLowerCase().includes(keyword) || 
      result.snippet.toLowerCase().includes(keyword)
    )
  ).slice(0, 5)
}
