const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
