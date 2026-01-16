import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items" });
    }

    // validate products and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    const order = await Order.create({
      user: user._id,
      clerkId: user.clerkId,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
    });

    // update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // check if each order has been reviewed

    const orderIds = orders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        };
      })
    );

    res.status(200).json({ orders: ordersWithReviewStatus });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const user = req.user;

    // Find the order
    const order = await Order.findById(orderId).populate("orderItems.product");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify that the order belongs to the authenticated user
    if (order.clerkId !== user.clerkId) {
      return res.status(403).json({ error: "Unauthorized access to this order" });
    }

    // Check if order has been reviewed
    const reviews = await Review.find({ orderId: order._id });
    const hasReviewed = reviews.length > 0;

    // Prepare detailed order response
    const orderDetails = {
      _id: order._id,
      user: order.user,
      clerkId: order.clerkId,
      orderItems: order.orderItems.map((item) => ({
        product: item.product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        _id: item._id,
      })),
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        streetAddress: order.shippingAddress.streetAddress,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        phoneNumber: order.shippingAddress.phoneNumber,
        _id: order.shippingAddress._id,
      },
      paymentResult: {
        id: order.paymentResult.id,
        status: order.paymentResult.status,
        receiptUrl: order.paymentResult.receiptUrl || null,
        receiptNumber: order.paymentResult.receiptNumber || null,
      },
      totalPrice: order.totalPrice,
      status: order.status,
      hasReviewed,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      __v: order.__v,
    };

    // Console log for debugging
    console.log("\n=== Order Details ===");
    console.log("Order ID:", orderDetails._id);
    console.log("User ID:", orderDetails.user);
    console.log("Clerk ID:", orderDetails.clerkId);
    console.log("Total Items:", orderDetails.orderItems.length);
    console.log("Total Price:", `$${orderDetails.totalPrice.toFixed(2)}`);
    console.log("Status:", orderDetails.status);
    console.log("Payment Status:", orderDetails.paymentResult.status);
    console.log("Receipt URL:", orderDetails.paymentResult.receiptUrl || "Not available");
    console.log("Has Reviewed:", orderDetails.hasReviewed);
    console.log("Order Date:", orderDetails.createdAt);
    console.log("\nShipping Address:");
    console.log(`  ${orderDetails.shippingAddress.fullName}`);
    console.log(`  ${orderDetails.shippingAddress.streetAddress}`);
    console.log(`  ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}`);
    console.log(`  Phone: ${orderDetails.shippingAddress.phoneNumber}`);
    console.log("\nOrder Items:");
    orderDetails.orderItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     Price: $${item.price.toFixed(2)} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
    });
    console.log("=====================\n");

    res.status(200).json({ order: orderDetails });
  } catch (error) {
    console.error("Error in getOrderById controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
