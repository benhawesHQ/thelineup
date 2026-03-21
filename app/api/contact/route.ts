import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    const emailSubject = subject || "New message from The Lineup"
    const fullSubject = `[The Lineup Support] ${emailSubject}`

    // If Resend is configured, send email
    if (resend) {
      await resend.emails.send({
        from: "The Lineup <noreply@thelineup.app>",
        to: "benjhawes@gmail.com",
        replyTo: email,
        subject: fullSubject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #F94501;">New Support Message</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0;"><strong>Subject:</strong> ${subject || "No subject"}</p>
            </div>
            
            <div style="background: #fff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #888; font-size: 12px; margin-top: 20px;">
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        `
      })
    } else {
      // Log for development when Resend isn't configured
      console.log("[Contact Form] New message received:")
      console.log(`  From: ${name} <${email}>`)
      console.log(`  Subject: ${subject || "No subject"}`)
      console.log(`  Message: ${message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Contact Form] Error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
