import { NextResponse } from "next/server"
import { headers } from "next/headers"

// Stripe webhook handler
// Handles subscription events to update user status

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log("[Webhook] Stripe not configured")
      return NextResponse.json({ received: true, mock: true })
    }

    // Dynamic import
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error("[Webhook] Signature verification failed")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle subscription events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        console.log("[Webhook] Checkout completed:", session.customer_email)
        
        // TODO: Update user status in database
        // - Set status to "active"
        // - Store stripeCustomerId
        // - Store stripeSubscriptionId
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        console.log("[Webhook] Subscription updated:", subscription.id)
        
        // TODO: Update subscription status in database
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        console.log("[Webhook] Subscription cancelled:", subscription.id)
        
        // TODO: Update user status to "cancelled"
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        console.log("[Webhook] Payment failed:", invoice.customer_email)
        
        // TODO: Handle failed payment (send email, update status)
        break
      }

      default:
        console.log("[Webhook] Unhandled event:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Webhook] Error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
