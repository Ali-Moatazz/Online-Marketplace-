const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    // Check if user has buyer role
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ 
        success: false,
        error: 'Only buyers can create orders' 
      });
    }

    const { products } = req.body;
    const userId = req.user.userId;
    
    let totalPrice = 0;
    const productUpdates = [];

    // Validate products and calculate total price
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          error: `Product ${item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          error: `Insufficient stock for ${product.title}. Only ${product.stock} available` 
        });
      }

      // Reduce stock
      product.stock -= item.quantity;
      productUpdates.push(product.save());
      
      totalPrice += product.price * item.quantity;
    }

    // Wait for all stock updates
    await Promise.all(productUpdates);

    // Create order
    const order = await Order.create({
      userId,
      products,
      totalPrice,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders;
    
    // Sellers can only see orders for their products
    if (req.user.role === 'seller') {
      // Get all products by this seller
      const sellerProducts = await Product.find({ sellerId: req.user.userId });
      const productIds = sellerProducts.map(p => p._id);
      
      // Find orders that contain these products
      orders = await Order.find({ 
        'products.productId': { $in: productIds } 
      }).populate("products.productId").populate("userId", "name email");
    } else {
      // Buyers and admins can see all orders (or adjust as needed)
      orders = await Order.find().populate("products.productId").populate("userId", "name email");
    }
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'buyer') {
      // Buyers can only see their own orders
      if (req.params.userId !== req.user.userId) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to view these orders' 
        });
      }
      orders = await Order.find({ userId: req.params.userId })
        .populate("products.productId")
        .populate("userId", "name email");
    } else if (req.user.role === 'seller') {
      // Sellers can see orders for their products
      const sellerProducts = await Product.find({ sellerId: req.user.userId });
      const productIds = sellerProducts.map(p => p._id);
      
      orders = await Order.find({ 
        'products.productId': { $in: productIds } 
      }).populate("products.productId").populate("userId", "name email");
    }
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ... rest of the functions remain similar but you can add role checks as needed
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Find Order, Buyer, AND Seller info
    // We need to look deep into products -> productId -> sellerId to find the seller
    const existingOrder = await Order.findById(id)
      .populate('userId') // The Buyer
      .populate({
        path: 'products.productId',
        populate: { 
          path: 'sellerId', 
          select: 'email storeName googleAppPassword' // Explicitly select the password
        }
      });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const oldStatus = existingOrder.status;
    const buyer = existingOrder.userId;

    // 2. Identify the Seller (Assuming single seller per order for simplicity)
    // If multiple sellers, we pick the first one found in the product list
    let seller = null;
    if (existingOrder.products.length > 0 && existingOrder.products[0].productId) {
      seller = existingOrder.products[0].productId.sellerId;
    }

    // 3. Update the Order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    // 4. Send Email IF status changed AND Seller has credentials
    if (status && oldStatus !== status && buyer && seller && seller.googleAppPassword) {
      
      console.log(`Attempting to send email via Seller: ${seller.email}`);

      // --- DYNAMIC TRANSPORTER CREATION ---
      const sellerTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: seller.email, // Use SELLER'S email
          pass: seller.googleAppPassword, // Use SELLER'S App Password
        },
      });

      const mailOptions = {
        from: `"${seller.storeName}" <${seller.email}>`, // Sent from Seller
        to: buyer.email,
        subject: `Order Update: #${id}`,
        html: `
          <h3>Hello ${buyer.name},</h3>
          <p>This is an update from <strong>${seller.storeName}</strong>.</p>
          <p>Your order status is now: <strong style="color:blue">${status}</strong>.</p>
        `
      };

      // Send using the dynamic transporter
      sellerTransporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`❌ Failed to send email via ${seller.email}:`, err.message);
        } else {
          console.log(`✅ Email sent from ${seller.email} to ${buyer.email}`);
        }
      });

      
      
    } else if (status && oldStatus !== status) {
      console.log("Skipping email: Seller has not configured App Password.");
    }

    res.json(updatedOrder);
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }

    const { status } = req.body;
    const oldStatus = order.status;
    order.status = status;

    // If order is being cancelled, restore stock
    if (oldStatus !== 'cancelled' && status === 'cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    res.json({
      success: true,
      order
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }

    // Restore stock if order wasn't already cancelled
    if (order.status !== 'cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: "Order removed and stock restored" 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};