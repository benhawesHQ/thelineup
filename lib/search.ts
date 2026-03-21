import { User, SearchResult } from "./types"

export function getSearchQueries(user: User): string[] {
  const { location, interests, goals } = user
  const interestList = interests.split(",").map(i => i.trim()).filter(Boolean)
  
  const queries: string[] = []
  
  // Generate varied search queries based on user profile
  queries.push(`${goals} opportunities ${location}`)
  queries.push(`${interests} jobs hiring ${location}`)
  queries.push(`${interests} grants applications open 2024`)
  queries.push(`${interests} scholarships ${location}`)
  queries.push(`${interests} fellowship programs`)
  queries.push(`${goals} remote opportunities`)
  
  // Add specific queries for each interest
  interestList.slice(0, 3).forEach(interest => {
    queries.push(`${interest} career opportunities ${location}`)
  })
  
  return queries.slice(0, 6) // Limit to 6 queries
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
