const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        unique: true,
        default: () => "NA" + Date.now() + Math.floor(Math.random() * 1000)
    },

    userEmail: String,

    // Product array for multi-item orders
    products: [{
        product: String,
        price: Number,
        quantity: Number,
        image: String
    }],

    // Legacy single-product fields (backward compatibility)
    product: String,
    price: Number,
    quantity: Number,

    totalAmount: Number,

    // Coupon
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },

    // Delivery charge
    deliveryCharge: { type: Number, default: 0 },

    // Delivery address fields
    customerName: String,
    mobile: String,
    address: String,
    city: String,
    pincode: String,
    state: String,
    landmark: String,

    paymentMethod: String,

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    },

    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"],
        default: "Pending"
    },

    // Full tracking timeline - every status change is recorded
    trackingHistory: [{
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: String
    }],

    // Delivery boy assignment
    deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    deliveryBoyName: String,
    deliveryBoyMobile: String,

    // Delivery OTP (for confirm on delivery)
    deliveryOTP: String,
    deliveryOTPVerified: { type: Boolean, default: false },

    // Estimated delivery date
    estimatedDelivery: Date,

    // Razorpay integration fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Order", orderSchema);