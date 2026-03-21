import { NextResponse } from "next/server"

// Note: This will work once Stripe integration is added via v0 integrations
// For now, it provides mock functionality

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("[Stripe] Not configured - returning mock checkout URL")
      return NextResponse.json({
        url: "/checkout/success?mock=true",
        message: "Stripe not configured - mock mode"
      })
    }

    // Dynamic import to avoid build errors when Stripe isn't installed
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "The Lineup",
              description: "5 personalized opportunities delivered every Monday",
            },
            unit_amount: 900, // $9.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        userId: userId || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`,
      // Free trial
      subscription_data: {
        trial_period_days: 28, // 4 weeks free
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[Checkout] Error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
