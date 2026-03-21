import { NextResponse } from "next/server"
import { getActiveUsers } from "@/lib/users"
import { getSearchQueries, fetchSearchResults, dedupeResults } from "@/lib/search"
import { generateEmail } from "@/lib/ai"
import { sendEmail } from "@/lib/email"

// Vercel Cron - schedule is defined in vercel.json
// Runs every Monday at 9am UTC (2am PST, 5am EST)

export async function GET(request: Request) {
  // Verify cron secret for security (optional but recommended)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Only get users who are on free trial or have active subscriptions
    const users = getActiveUsers()
    const results = []
    
    console.log(`[Weekly Run] Processing ${users.length} active users`)

    for (const user of users) {
      try {
        console.log(`[Weekly Run] Processing: ${user.email}`)
        
        // Generate search queries based on user profile
        const queries = getSearchQueries(user)
        
        // Fetch results for each query
        const allResults = []
        for (const query of queries) {
          const searchResults = await fetchSearchResults(query)
          allResults.push(...searchResults)
        }
        
        // Dedupe results
        const uniqueResults = dedupeResults(allResults)
        
        // Generate personalized email
        const emailContent = await generateEmail(user, uniqueResults)
        
        // Send the email
        const sent = await sendEmail(user, emailContent)
        
        results.push({
          email: user.email,
          status: user.status,
          success: sent,
          opportunities: emailContent.opportunities.length
        })
        
        console.log(`[Weekly Run] Sent to ${user.email}: ${sent ? "success" : "failed"}`)
      } catch (error) {
        console.error(`[Weekly Run] Error for ${user.email}:`, error)
        results.push({
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
  } catch (error) {
    console.error("[Weekly Run] Fatal error:", error)
    return NextResponse.json(
      { error: "Failed to process weekly lineup" },
      { status: 500 }
    )
  }
}
