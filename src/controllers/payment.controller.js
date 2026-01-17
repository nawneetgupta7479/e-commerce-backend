import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { sendEmail } from "../config/nodemailer.js";
import { orderCreatedUserTemplate } from "../lib/emailTemplates.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export async function createPaymentIntent(req, res) {
  try {
    const { cartItems, shippingAddress } = req.body;
    const user = req.user;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total from server-side (don't trust client - ever.)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      subtotal += product.price * item.quantity;
      validatedItems.push({
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    const shipping = 10.0; // $10
    const tax = subtotal * 0.08; // 8%
    const total = subtotal + shipping + tax;

    if (total <= 0) {
      return res.status(400).json({ error: "Invalid order total" });
    }

    // find or create the stripe customer
    let customer;
    if (user.stripeCustomerId) {
      // find the customer
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      // create the customer
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          clerkId: user.clerkId,
          userId: user._id.toString(),
        },
      });

      // add the stripe customer ID to the  user object in the DB
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    }

    // create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // convert to cents
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        clerkId: user.clerkId,
        userId: user._id.toString(),
        orderItems: JSON.stringify(validatedItems),
        shippingAddress: JSON.stringify(shippingAddress),
        totalPrice: total.toFixed(2),
      },
      // in the webhooks section we will use this metadata
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment_intent.succeeded - Create Order
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    console.log("Payment succeeded:", paymentIntent.id);

    try {
      const { userId, clerkId, orderItems, shippingAddress, totalPrice } = paymentIntent.metadata;

      // Check if order already exists (prevent duplicates)
      const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntent.id });
      if (existingOrder) {
        console.log("Order already exists for payment:", paymentIntent.id);
        return res.json({ received: true });
      }

      // Get user email
      const user = await User.findById(userId);

      // create order
      const order = await Order.create({
        user: userId,
        clerkId,
        orderItems: JSON.parse(orderItems),
        shippingAddress: JSON.parse(shippingAddress),
        paymentResult: {
          id: paymentIntent.id,
          status: "succeeded",
          receiptUrl: null,
        },
        totalPrice: parseFloat(totalPrice),
      });

      // update product stock
      const items = JSON.parse(orderItems);
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      console.log("Order created successfully:", order._id);

      // Send order confirmation email to user
      if (user?.email) {
        setImmediate(async () => {
          try {
            const emailTemplate = orderCreatedUserTemplate(order);
            const result = await sendEmail({
              from: `"ShopKart" <${ENV.EMAIL_USER}>`,
              to: user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });

            if (result.success) {
              console.log(`✅ Order confirmation email sent to: ${user.email}`);
            } else {
              console.log(`❌ Failed to send order confirmation email: ${result.error}`);
            }
          } catch (emailError) {
            console.error("❌ Email error:", emailError.message);
          }
        });
      }
    } catch (error) {
      console.error("Error creating order from webhook:", error);
    }
  }

  // Handle charge.succeeded - Capture Receipt URL
  if (event.type === "charge.succeeded") {
    const charge = event.data.object;

    console.log("Charge succeeded:", charge.id);
    console.log("Receipt URL:", charge.receipt_url);

    try {
      const paymentIntentId = charge.payment_intent;

      if (paymentIntentId && charge.receipt_url) {
        // Update the order with the receipt URL
        const updatedOrder = await Order.findOneAndUpdate(
          { "paymentResult.id": paymentIntentId },
          { 
            "paymentResult.receiptUrl": charge.receipt_url,
            "paymentResult.receiptNumber": charge.receipt_number,
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log("Order updated with receipt URL:", updatedOrder._id);
          console.log("Receipt URL saved:", charge.receipt_url);
        } else {
          console.log("Order not found for payment intent:", paymentIntentId);
        }
      }
    } catch (error) {
      console.error("Error updating order with receipt URL:", error);
    }
  }

  // Handle charge.updated - Update Receipt URL if changed
  if (event.type === "charge.updated") {
    const charge = event.data.object;

    console.log("Charge updated:", charge.id);

    try {
      const paymentIntentId = charge.payment_intent;

      if (paymentIntentId && charge.receipt_url) {
        // Update the order with the latest receipt URL
        const updatedOrder = await Order.findOneAndUpdate(
          { "paymentResult.id": paymentIntentId },
          { 
            "paymentResult.receiptUrl": charge.receipt_url,
            "paymentResult.receiptNumber": charge.receipt_number,
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log("Order receipt URL updated:", updatedOrder._id);
        }
      }
    } catch (error) {
      console.error("Error updating order receipt URL:", error);
    }
  }

  res.json({ received: true });
}

export async function getUserPayments(req, res) {
  try {
    const user = req.user;

    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return res.status(200).json({ success: true, count: 0, payments: [] });
    }

    // Fetch all charges for this customer (charges contain receipt_url)
    const charges = await stripe.charges.list({
      customer: user.stripeCustomerId,
      limit: 100,
    });

    // Filter only succeeded charges and format the data
    const successfulPayments = charges.data
      .filter((charge) => charge.status === "succeeded" && charge.paid === true)
      .map((charge) => {
        return {
          id: charge.id,
          paymentIntentId: charge.payment_intent,
          amount: charge.amount / 100, // Convert from cents to dollars
          currency: charge.currency.toUpperCase(),
          status: charge.status,
          created: new Date(charge.created * 1000), // Convert timestamp to date
          description: charge.description || "Order Payment",
          receiptUrl: charge.receipt_url || null,
          receiptNumber: charge.receipt_number || null,
          paymentMethod: charge.payment_method_details?.type || "card",
          metadata: charge.metadata || {},
          billingDetails: charge.billing_details || {},
        };
      });

    // Console log the payments for debugging
    console.log("\n=== User Successful Payments ===");
    console.log("User ID:", user._id);
    console.log("Clerk ID:", user.clerkId);
    console.log("Stripe Customer ID:", user.stripeCustomerId);
    console.log("Total Successful Payments:", successfulPayments.length);
    console.log("\nPayment Details:");
    successfulPayments.forEach((payment, index) => {
      console.log(`\n--- Payment ${index + 1} ---`);
      console.log("Charge ID:", payment.id);
      console.log("Payment Intent ID:", payment.paymentIntentId);
      console.log("Amount:", `$${payment.amount.toFixed(2)} ${payment.currency}`);
      console.log("Status:", payment.status);
      console.log("Date:", payment.created.toISOString());
      console.log("Receipt URL:", payment.receiptUrl || "Not available");
      console.log("Receipt Number:", payment.receiptNumber || "Not available");
      console.log("Payment Method:", payment.paymentMethod);
    });
    console.log("\n=================================\n");

    res.status(200).json({
      success: true,
      count: successfulPayments.length,
      payments: successfulPayments,
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
}
