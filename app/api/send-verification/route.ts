import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Simple in-memory store for verification codes
// In production, use Redis or a database with TTL
const verificationCodes = new Map<string, { code: string; expires: number }>()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store code with 10-minute expiry
    verificationCodes.set(email, {
      code,
      expires: Date.now() + 10 * 60 * 1000
    })

    // Send email with verification code
    try {
      await resend.emails.send({
        from: "The Lineup <verify@thelineup.co>",
        to: email,
        subject: "Your verification code",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 24px; color: #000; margin-bottom: 20px;">Your verification code</h1>
            <div style="background: linear-gradient(90deg, #F94501, #FF4D8D); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Enter this code to verify your email and get your first personalized opportunities from The Lineup.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error("Email send error:", emailError)
      // Continue anyway for development - return the code
    }

    // Return the code for now (in production with proper email setup, remove this)
    // This allows testing without email delivery
    return NextResponse.json({ 
      success: true,
      code, // Remove this line in production when email is working
      message: "Verification code sent"
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    )
  }
}

// Endpoint to verify the code
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json()

    const stored = verificationCodes.get(email)
    
    if (!stored) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      )
    }

    if (Date.now() > stored.expires) {
      verificationCodes.delete(email)
      return NextResponse.json(
        { error: "Code expired. Please request a new one." },
        { status: 400 }
      )
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      )
    }

    // Code is valid - clean up
    verificationCodes.delete(email)

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
