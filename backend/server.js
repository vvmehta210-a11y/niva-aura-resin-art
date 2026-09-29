require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Review = require("./models/Review");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require("./models/Order");
const DeliveryBoy = require("./models/DeliveryBoy");
const User = require("./models/User");
const LoginHistory = require("./models/LoginHistory");
const app = express();
app.set("trust proxy", 1);
const Contact = require("./models/Contact");
const Product = require("./models/Product");
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Error:", error);
    } else {
        console.log("SMTP Server Ready");
    }
});
let otpStore = {};
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));
app.use(cors());
app.use(express.json());
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images (jpeg, jpg, png, gif, webp) are allowed!"));
    }
});

// Middleware to verify regular user JWT
const verifyUserToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

// Middleware to verify admin JWT
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");
        if (verified.role !== "admin") {
            return res.status(403).json({ message: "Access Denied: Admins Only" });
        }
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
};
app.get("/", (req, res) => {
    res.send("Niva Aura Resin Art API Run");
});

app.post("/upload", (req, res) => {
    upload.single("image")(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }
        res.json({
            message: "Image uploaded successfully",
            filename: req.file.filename
        });
    });
});
app.post("/signup", async (req, res) => {

    try {

        const {
            name,
            lastName,
            email,
            password
        } = req.body;

        const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {

    return res.status(400).json({
        message: "Please enter a valid email address"
    });
}

if (password.length < 6) {

    return res.status(400).json({
        message: "Password must be at least 6 characters"
    });
}

        const existingUser =
        await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message:
                "Email already registered"
            });
        }

        const hashedPassword =
        await bcrypt.hash(password, 10);

        const user = new User({

            name,
            lastName,
            email,
            password:
            hashedPassword

        });

        await user.save();

        res.json({
            message:
            "Account Created Successfully"
        });

    } catch (error) {

        res.status(500).json(error);
    }
});
app.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
        await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                message:
                "User Not Found"
            });
        }
        // if(!user.verified){

        // return res.status(400).json({
        //     message: "Please Verify Email"
        //     });

        // }
        const validPassword =
        await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {

    return res.status(400).json({
        message:
        "Wrong Password"
    });
}

await LoginHistory.create({
    email: user.email
});

const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "JWT_SECRET"
);
        res.json({

            message:
            "Login Successful",

            token,

            name:
            user.name

        });

    } catch (error) {

        res.status(500).json(error);
    }
});

app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "vatsal" && password === "Vatsal@210") {
        const token = jwt.sign(
            { role: "admin", username },
            process.env.JWT_SECRET || "JWT_SECRET",
            { expiresIn: "2h" }
        );
        return res.json({ token });
    }
    return res.status(401).json({ message: "Invalid Admin Credentials" });
});

app.post("/send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        const otp =
        Math.floor(
            100000 + Math.random() * 900000
        );

        otpStore[email] = otp;
        console.log("Signup OTP for " + email + " is: " + otp);

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: email,

            subject:

            "Niva Aura Email Verification",

            text:

            `Your OTP is ${otp}`

        });

        res.json({
            message:
            "OTP Sent Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
            "Failed To Send OTP"
        });
    }
});

app.post("/verify-otp", (req, res) => {
    const {
        email,
        otp
    } = req.body;

    if (!email || !otp || !otpStore[email] || otpStore[email].toString() !== otp.toString()) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    delete otpStore[email];

    // Sign a temporary reset token valid for 10 minutes
    const resetToken = jwt.sign(
        { email, type: "password-reset" },
        process.env.JWT_SECRET || "JWT_SECRET",
        { expiresIn: "10m" }
    );

    res.json({
        message: "OTP Verified Successfully",
        resetToken
    });
});

app.get("/users", verifyAdminToken, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post("/order", verifyUserToken, async (req,res)=>{
    console.log("ORDER RECEIVED:", req.body);

    try{
        const orderData = req.body;
        // Generate a unique orderId if not provided
        if (!orderData.orderId) {
            orderData.orderId = "NA" + Date.now() + Math.floor(Math.random() * 1000);
        }
        const order = new Order(orderData);
        await order.save();
        console.log("ORDER SAVED:", order.orderId);
        res.json({
            message: "Order Saved",
            orderId: order.orderId,
            _id: order._id
        });
    }catch(error){
        console.error("Order Error:", error);
        res.status(500).json({ message: error.message || "Order failed" });
    }
});

/* =========================
   Coupon Validation
========================= */
const COUPONS = {
    "NIVA10":  { discount: 10, type: "percent", label: "10% off on all orders" },
    "NIVA50":  { discount: 50, type: "flat",    label: "Flat ₹50 off" },
    "RESIN15": { discount: 15, type: "percent", label: "15% off on resin art" },
    "FIRST100":{ discount: 100, type: "flat",   label: "₹100 off your first order" }
};

app.post("/validate-coupon", verifyUserToken, (req, res) => {
    const { code, cartTotal } = req.body;
    const coupon = COUPONS[code ? code.toUpperCase() : ""];
    if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
    }
    let discountAmount = 0;
    if (coupon.type === "percent") {
        discountAmount = Math.round((cartTotal * coupon.discount) / 100);
    } else {
        discountAmount = coupon.discount;
    }
    discountAmount = Math.min(discountAmount, cartTotal);
    res.json({
        valid: true,
        code: code.toUpperCase(),
        discountAmount,
        label: coupon.label
    });
});

app.get("/coupons", verifyUserToken, (req, res) => {
    const list = Object.entries(COUPONS).map(([code, data]) => ({
        code,
        label: data.label,
        type: data.type,
        discount: data.discount
    }));
    res.json(list);
});

/* =========================
   Razorpay – Payment Gateway Skeleton
   (Install razorpay package and add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to .env to activate)
========================= */
app.post("/razorpay/create-order", verifyUserToken, async (req, res) => {
    // Placeholder: Replace with real Razorpay integration
    // const Razorpay = require('razorpay');
    // const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const options = { amount: req.body.amount * 100, currency: 'INR', receipt: 'receipt_' + Date.now() };
    // const order = await rzp.orders.create(options);
    res.json({ message: "Razorpay not yet configured. Use COD or UPI for now.", configured: false });
});

app.post("/razorpay/verify", verifyUserToken, async (req, res) => {
    // Placeholder: server-side HMAC signature verification goes here
    // const crypto = require('crypto');
    // const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    // const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    // hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    // const digest = hmac.digest('hex');
    // if (digest !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });
    // await Order.updateOne({ orderId }, { paymentStatus: 'Paid', razorpayPaymentId: razorpay_payment_id });
    res.json({ message: "Razorpay not yet configured.", verified: false });
});

app.post("/reset-password", async (req, res) => {
    const {
        email,
        otp,
        resetToken,
        newPassword
    } = req.body;

    let targetEmail = email;

    if (resetToken) {
        try {
            const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "JWT_SECRET");
            if (decoded.type !== "password-reset") {
                return res.status(400).json({
                    message: "Invalid Reset Token Type"
                });
            }
            targetEmail = decoded.email;
        } catch (err) {
            return res.status(400).json({
                message: "Invalid or Expired Reset Token"
            });
        }
    } else {
        // Fallback to legacy email/otp check (if needed)
        if (!email || !otp || !otpStore[email] || otpStore[email].toString() !== otp.toString()) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }
        delete otpStore[email];
    }

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
        { email: targetEmail },
        {
            password: hashedPassword
        }
    );

    res.json({
        message: "Password Updated Successfully"
    });
});
app.post("/forgot-password", async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

        return res.status(400).json({
            message: "Email Not Found"
        });
    }

    const otp =
    Math.floor(
        100000 + Math.random() * 900000
    );

    otpStore[email] = otp;
    console.log("Forgot Password OTP for " + email + " is: " + otp);

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "Password Reset OTP",

        text: `Your OTP is ${otp}`

    });

    res.json({
        message: "OTP Sent Successfully"
    });

});

app.get("/orders/:email", verifyUserToken, async (req,res)=>{
    // Regular users can only see their own orders; admins can see any orders
    if (req.user.role !== "admin" && req.user.email !== req.params.email) {
        return res.status(403).json({ message: "Access Denied: Unauthorized Order Access" });
    }

    try{
        const orders = await Order.find({
            userEmail: req.params.email
        });
        res.json(orders);
    }catch(error){
        res.status(500).json(error);
    }
});

app.get("/login-history", verifyAdminToken, async (req, res) => {
    try {
        const history = await LoginHistory.find().sort({ loginTime: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post("/review", verifyUserToken, async (req,res)=>{
    try{
        const review = new Review(req.body);
        await review.save();
        res.json({
            message: "Review Added Successfully"
        });
    }catch(error){
        res.status(500).json(error);
    }
});

app.get("/reviews/:product", async (req,res)=>{

    try{

        const reviews =
        await Review.find({

            product:
            req.params.product

        });

        res.json(reviews);

    }catch(error){

        res.status(500).json(error);
    }

});

app.post("/contact", async(req,res)=>{

    try{

        const contact =
        new Contact(req.body);

        await contact.save();

        res.json({
            message:
            "Message Sent Successfully"
        });

    }catch(error){

    console.log(error);

    res.status(500).json({
        message: error.message
    });
}
});


app.post("/add-product", verifyAdminToken, async (req,res)=>{
    try{
        const product = new Product(req.body);
        await product.save();
        res.json({
            message: "Product Added Successfully"
        });
    }catch(error){
        res.status(500).json(error);
    }
});

app.get("/products", async (req,res)=>{
    try{
        const products = await Product.find();
        res.json(products);
    }catch(error){
        res.status(500).json(error);
    }
});

app.delete("/delete-product/:id", verifyAdminToken, async (req,res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id);
        res.json({
            message: "Product Deleted Successfully"
        });
    }catch(error){
        res.status(500).json(error);
    }
});

/* =========================
   Admin: All Orders (with filters)
========================= */
app.get("/admin/orders", verifyAdminToken, async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        if (status && status !== "All") query.status = status;
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
                { customerName: { $regex: search, $options: "i" } },
                { product: { $regex: search, $options: "i" } }
            ];
        }
        const orders = await Order.find(query).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Admin: Update Order Status
========================= */
app.patch("/admin/order/:id/status", verifyAdminToken, async (req, res) => {
    try {
        const { status, message, updatedBy } = req.body;
        const allowedStatuses = ["Pending","Confirmed","Processing","Packed","Shipped","Out for Delivery","Delivered","Cancelled","Returned"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const trackingEntry = {
            status,
            message: message || `Order ${status}`,
            timestamp: new Date(),
            updatedBy: updatedBy || "Admin"
        };
        // Generate delivery OTP when status is "Out for Delivery"
        let otp = undefined;
        if (status === "Out for Delivery") {
            otp = Math.floor(1000 + Math.random() * 9000).toString();
        }
        const update = {
            status,
            $push: { trackingHistory: trackingEntry }
        };
        if (status === "Delivered") update.paymentStatus = "Paid";
        if (otp) update.deliveryOTP = otp;
        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Status updated", order, deliveryOTP: otp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Admin: Assign Delivery Boy
========================= */
app.patch("/admin/order/:id/assign-delivery", verifyAdminToken, async (req, res) => {
    try {
        const { deliveryBoyId } = req.body;
        const db = await DeliveryBoy.findById(deliveryBoyId);
        if (!db) return res.status(404).json({ message: "Delivery boy not found" });
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const order = await Order.findByIdAndUpdate(req.params.id, {
            deliveryBoyId: db._id,
            deliveryBoyName: db.name,
            deliveryBoyMobile: db.mobile,
            deliveryOTP: otp,
            status: "Out for Delivery",
            $push: { trackingHistory: { status: "Out for Delivery", message: `Assigned to ${db.name} (${db.mobile})`, updatedBy: "Admin" } }
        }, { new: true });
        res.json({ message: `Order assigned to ${db.name}`, deliveryOTP: otp, order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Delivery Boy: Register (Admin only)
========================= */
app.post("/delivery-boy/register", verifyAdminToken, async (req, res) => {
    try {
        const { name, mobile, email, password, vehicleType, vehicleNumber } = req.body;
        const exists = await DeliveryBoy.findOne({ $or: [{ email }, { mobile }] });
        if (exists) return res.status(400).json({ message: "Delivery boy with this email/mobile already exists" });
        const hashed = await bcrypt.hash(password, 10);
        const db = new DeliveryBoy({ name, mobile, email, password: hashed, vehicleType, vehicleNumber });
        await db.save();
        res.json({ message: "Delivery boy registered", id: db._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Delivery Boy: Login
========================= */
app.post("/delivery-boy/login", async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const db = await DeliveryBoy.findOne({ mobile });
        if (!db) return res.status(400).json({ message: "Delivery partner not found" });
        const valid = await bcrypt.compare(password, db.password);
        if (!valid) return res.status(400).json({ message: "Wrong password" });
        const token = jwt.sign(
            { id: db._id, name: db.name, mobile: db.mobile, role: "delivery" },
            process.env.JWT_SECRET || "JWT_SECRET"
        );
        res.json({ message: "Login successful", token, name: db.name, id: db._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Delivery Boy Token Middleware
========================= */
const verifyDeliveryToken = (req, res, next) => {
    const token = (req.headers["authorization"] || "").split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "JWT_SECRET");
        if (decoded.role !== "delivery") return res.status(403).json({ message: "Not a delivery account" });
        req.delivery = decoded;
        next();
    } catch {
        res.status(403).json({ message: "Invalid token" });
    }
};

/* =========================
   Delivery Boy: Get Assigned Orders
========================= */
app.get("/delivery/orders", verifyDeliveryToken, async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryBoyId: req.delivery.id,
            status: { $in: ["Out for Delivery", "Delivered"] }
        }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Delivery Boy: Confirm Delivery via OTP
========================= */
app.post("/delivery/confirm/:orderId", verifyDeliveryToken, async (req, res) => {
    try {
        const { otp } = req.body;
        const order = await Order.findOne({ _id: req.params.orderId, deliveryBoyId: req.delivery.id });
        if (!order) return res.status(404).json({ message: "Order not found or not assigned to you" });
        if (order.deliveryOTPVerified) return res.status(400).json({ message: "Already delivered" });
        if (order.deliveryOTP !== otp.toString()) return res.status(400).json({ message: "Invalid OTP. Ask customer for 4-digit delivery OTP." });
        order.status = "Delivered";
        order.paymentStatus = "Paid";
        order.deliveryOTPVerified = true;
        order.trackingHistory.push({ status: "Delivered", message: "Delivered to customer. OTP verified.", updatedBy: req.delivery.name });
        await order.save();
        await DeliveryBoy.findByIdAndUpdate(req.delivery.id, { $inc: { totalDeliveries: 1 } });
        res.json({ message: "Delivery confirmed!", order });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Admin: List Delivery Boys
========================= */
app.get("/admin/delivery-boys", verifyAdminToken, async (req, res) => {
    try {
        const boys = await DeliveryBoy.find().select("-password");
        res.json(boys);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Customer: Order Tracking by orderId
========================= */
app.get("/order-track/:orderId", async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId }).select(
            "orderId status trackingHistory products product price quantity totalAmount customerName address city state pincode paymentMethod paymentStatus deliveryBoyName deliveryBoyMobile estimatedDelivery date"
        );
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* =========================
   Start Server
========================= */

app.listen(5000, () => {
    console.log(
        "Server running on port 5000"
    );
});