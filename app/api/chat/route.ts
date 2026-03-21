import { streamText, convertToModelMessages } from "ai"
import { OnboardingData } from "@/lib/types"

// System prompt for the onboarding chat
const SYSTEM_PROMPT = `You are the friendly onboarding assistant for The Lineup - a service that finds visibility-building opportunities for creative professionals.

Your job is to have a natural conversation to learn about the user so you can personalize their weekly opportunity emails.

Key things you need to learn:
1. What they do (speaker, writer, artist, founder, etc.)
2. What kind of visibility they're looking for (speaking gigs, podcast features, bylines, grants, etc.)
3. Their topics/expertise areas
4. Their goals for the next 1-2 years
5. Their email address

Conversation style:
- Be warm and casual, like a helpful friend
- Use short messages, not long paragraphs
- Ask follow-up questions when answers are vague ("Tell me more about that" or "What does that look like for you?")
- Don't ask for all info at once - have a real conversation
- Acknowledge what they say before moving to the next question
- If they give a vague answer, push back gently: "I want to make sure I get this right - can you give me a specific example?"

DO NOT:
- Sound robotic or like a form
- Ask multiple questions in one message
- Use corporate jargon
- Be overly enthusiastic with exclamation marks

When you have all the info, confirm their email and let them know their first Lineup arrives Monday at 9am.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    // Check if we should use mock mode
    if (!process.env.OPENAI_API_KEY) {
      // Return a mock streaming response
      const encoder = new TextEncoder()
      const mockResponse = "Hey! I'm currently in demo mode. Once the OpenAI API is connected, I'll be able to have a real conversation with you to learn about your goals and find the perfect opportunities. For now, you can explore the site and see what The Lineup is all about!"
      
      const stream = new ReadableStream({
        start(controller) {
          const words = mockResponse.split(' ')
          let i = 0
          
          const interval = setInterval(() => {
            if (i < words.length) {
              controller.enqueue(encoder.encode(`data: {"type":"text-delta","delta":"${words[i]} "}\n\n`))
              i++
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              clearInterval(interval)
            }
          }, 50)
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 200,
      temperature: 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[Chat] Error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process chat" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
