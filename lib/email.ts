import { User, LineupEmail } from "./types"
import { Resend } from "resend"

// Lazy initialization to avoid build errors when API key is not set
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

// Support both old DropEmail and new LineupEmail types
interface EmailContent {
  opportunities: Array<{
    title: string
    link: string
    reason: string
    type?: string
    deadline?: string
  }>
  body?: string
  greeting?: string
  signoff?: string
}

export async function sendEmail(user: User, content: EmailContent): Promise<boolean> {
  const html = generateEmailHTML(user, content)
  
  const resend = getResendClient()
  
  // If no API key, log the email instead
  if (!resend) {
    console.log("=== EMAIL PREVIEW ===")
    console.log("To:", user.email)
    console.log("Subject: Your Monday Lineup is Here")
    console.log("Content:", content)
    console.log("===================")
    return true
  }
  
  try {
    const { error } = await resend.emails.send({
      from: "The Lineup <lineup@updates.thelineup.app>",
      to: user.email,
      subject: "Your Monday Lineup is Here",
      html
    })
    
    if (error) {
      console.error("Resend error:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}

function generateEmailHTML(user: User, content: EmailContent): string {
  const firstName = user.name?.split(" ")[0] || "there"
  const greeting = content.greeting || `Hey ${firstName},\n\nHappy Monday. Here are 5 opportunities I pulled together just for you this week — based on your goals and what you're building.`
  const signoff = content.signoff || "Go make some noise.\n\n— The Lineup"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Monday Lineup</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(90deg, #F94501 0%, #FF4D8D 50%, #8A5BFF 100%); border-radius: 12px; padding: 12px 16px;">
                <span style="color: white; font-weight: bold; font-size: 24px;">L</span>
              </div>
              <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 16px 0 0; text-transform: uppercase; letter-spacing: -0.5px;">YOUR LINEUP</h1>
              <p style="color: #666; font-size: 14px; margin: 8px 0 0;">Monday at 9am</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 0 20px;">
              <div style="color: #A0A0A0; font-size: 16px; line-height: 1.7; white-space: pre-line;">
                ${greeting}
              </div>
            </td>
          </tr>
          
          <!-- Opportunities -->
          <tr>
            <td style="padding: 20px 0;">
              ${content.opportunities.map((opp, i) => {
                const gradients = [
                  'linear-gradient(135deg, #F94501 0%, #FF6B35 100%)',
                  'linear-gradient(135deg, #FF4D8D 0%, #FF6B9D 100%)',
                  'linear-gradient(135deg, #8A5BFF 0%, #A87BFF 100%)',
                  'linear-gradient(135deg, #F94501 0%, #FF4D8D 100%)',
                  'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)'
                ]
                return `
                <div style="background-color: #0a0a0a; border-radius: 16px; padding: 24px; margin-bottom: 16px; border: 1px solid #1a1a1a;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="44" style="vertical-align: top; padding-right: 16px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: ${gradients[i]}; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-weight: bold; font-size: 18px; display: block; text-align: center; line-height: 44px;">${i + 1}</span>
                        </div>
                      </td>
                      <td style="vertical-align: top;">
                        ${opp.type ? `<span style="display: inline-block; color: #F94501; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${opp.type}${opp.deadline ? ` — Deadline: ${opp.deadline}` : ''}</span>` : ''}
                        <a href="${opp.link}" style="color: white; font-size: 18px; font-weight: 600; text-decoration: none; display: block; margin-bottom: 8px;">${opp.title}</a>
                        <p style="color: #A0A0A0; font-size: 14px; margin: 0; line-height: 1.6; font-style: italic;">"${opp.reason}"</p>
                        <a href="${opp.link}" style="display: inline-block; margin-top: 12px; color: #F94501; font-size: 14px; font-weight: 500; text-decoration: none;">Learn more →</a>
                      </td>
                    </tr>
                  </table>
                </div>
              `}).join("")}
            </td>
          </tr>
          
          <!-- Signoff -->
          <tr>
            <td style="padding: 20px 0 40px;">
              <div style="color: #A0A0A0; font-size: 16px; line-height: 1.7; white-space: pre-line;">
                ${signoff}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 0; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="color: #666; font-size: 13px; margin: 0;">You're receiving this because you signed up for The Lineup.</p>
              <p style="color: #666; font-size: 13px; margin: 8px 0 0;">Your 100% custom opportunity lineup. Every Monday at 9am.</p>
              <p style="margin: 16px 0 0;"><a href="#" style="color: #666; font-size: 12px; text-decoration: underline;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
