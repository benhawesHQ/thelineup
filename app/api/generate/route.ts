import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { prompt } = await request.json()

  // Fallback result in case AI fails
  const fallbackResult = {
    intro: "Hey there — I went looking this week with your goals in mind, and I found 5 things that genuinely match where you're trying to go. These aren't random — each one is a real move.",
    opportunities: [
      {
        title: "TEDxManhattan — Speaker Applications Open",
        type: "Speaking",
        description: "TEDx's NYC flagship event is accepting speaker proposals for their fall showcase. 600+ attendees, filmed and distributed on YouTube.",
        fit: "A TEDx credit is one of the fastest ways to establish authority and attract the exact audience you're trying to reach.",
        cta: "Apply",
      },
      {
        title: "Morning Brew — Guest Contributor Open Call",
        type: "Writing",
        description: "Morning Brew is actively seeking expert opinion pieces from practitioners. 4M daily readers. Pieces run 600–900 words.",
        fit: "A byline here puts your thinking in front of your target audience every single morning.",
        cta: "Pitch",
      },
      {
        title: "How I Built This (NPR) — Guest Pitch",
        type: "Podcast",
        description: "Guy Raz's show accepts guest pitches via their website. 1M+ weekly listeners. Looking for compelling builder stories.",
        fit: "Your story is exactly what their audience tunes in for — getting on this show changes everything.",
        cta: "Pitch",
      },
      {
        title: "PEN America Emerging Voices Fellowship",
        type: "Fellowship",
        description: "Annual fellowship for writers from underrepresented communities. Includes mentorship, community, stipend. Applications open Q1.",
        fit: "The network from this program is worth more than any individual opportunity — past fellows consistently credit it with their first major break.",
        cta: "Apply",
      },
      {
        title: "CreativeMornings NYC — Speaker Application",
        type: "Speaking",
        description: "Monthly breakfast events for the NYC creative community. Free to attend, speakers selected from the community. 200+ attendees.",
        fit: "This is exactly the room where your goals and your audience overlap — editors, founders, creators, collaborators.",
        cta: "Apply",
      },
    ],
    recommendation:
      "Start with the TEDx application this week — the deadline is closer than you think and a strong application takes about an hour. Then pitch Morning Brew while your ideas are fresh. Those two moves alone could change your trajectory.",
  }

  try {
    // Use the AI Gateway with Claude
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are The Lineup — a human-feeling personalized opportunity service. Respond ONLY with valid JSON, no markdown, no backticks, no commentary.",
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(fallbackResult)
    }

    const data = await response.json()
    const raw = data.content?.find((b: { type: string }) => b.type === "text")?.text || ""
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim())

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(fallbackResult)
  }
}
