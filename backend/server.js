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
const User = require("./models/User");
const LoginHistory = require("./models/LoginHistory");
const app = express();
app.set("trust proxy", 1);
const Contact = require("./models/Contact");
const Product = require("./models/Product");


/* =========================
   MongoDB Connection
========================= */

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});
const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

let otpStore = {};
/* =========================
   Security Middleware
========================= */

app.use(helmet());

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));
app.use("/uploads", express.static(uploadDir));

app.use(cors());
app.use(express.json());

/* =========================
   Image Upload
========================= */
/****************************
 Image Upload
****************************/

const uploadDir = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded images
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

const upload = multer({ storage });
/* =========================
   Home Route
========================= */

app.get("/", (req, res) => {
    res.send("Niva Aura Resin Art API Run");
});

/* =========================
   Upload Route
========================= */

app.post("/upload", upload.single("image"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded"
        });
    }

    res.json({
        message: "Image uploaded successfully",
        filename: req.file.filename
    });
});

/* =========================
   User Signup
========================= */

app.post("/signup", async (req, res) => {

    try {

        const {
            name,
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

/* =========================
   User Login
========================= */

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

/* Save Login History */
await LoginHistory.create({
    email: user.email
});

const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET
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
/* =========================
   Send OTP
========================= */

app.post("/send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        const otp =
        Math.floor(
            100000 + Math.random() * 900000
        );

        otpStore[email] = otp;

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

/* =========================
   Verify OTP
========================= */

app.post("/verify-otp", (req, res) => {

    const {
        email,
        otp
    } = req.body;

    if (otpStore[email] == otp) {

        delete otpStore[email];

        return res.json({
            message:
            "OTP Verified Successfully"
        });
    }

    res.status(400).json({
        message:
        "Invalid OTP"
    });
});

app.get("/users", async (req, res) => {

    try {

        const users = await User.find()
        .select("-password");

        res.json(users);

    } catch (error) {

        res.status(500).json(error);

    }

});
app.post("/order", async (req,res)=>{

    console.log("ORDER RECEIVED");
    console.log(req.body);

    try{

        const order =
        new Order(req.body);

        await order.save();

        console.log("ORDER SAVED");

        res.json({
            message:"Order Saved"
        });

    }catch(error){

        console.log(error);

        res.status(500).json(error);

    }

});

app.post("/reset-password", async (req, res) => {

    const {
        email,
        otp,
        newPassword
    } = req.body;

    if (otpStore[email] != otp) {

        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    const hashedPassword =
    await bcrypt.hash(
        newPassword,
        10
    );

    await User.updateOne(

        { email },

        {
            password:
            hashedPassword
        }

    );

    delete otpStore[email];

    res.json({
        message:
        "Password Updated Successfully"
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

app.get("/orders/:email", async (req,res)=>{

    try{

        const orders =
        await Order.find({

            userEmail:
            req.params.email

        });

        res.json(orders);

    }catch(error){

        res.status(500).json(error);

    }

});
app.get("/login-history", async (req, res) => {

    try {

        const history =
        await LoginHistory.find()
        .sort({ loginTime: -1 });

        res.json(history);

    } catch (error) {

        res.status(500).json(error);

    }

});

app.post("/review", async (req,res)=>{

    try{

        const review =
        new Review(req.body);

        await review.save();

        res.json({
            message:
            "Review Added Successfully"
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


app.post("/add-product", async (req,res)=>{

    try{

        const product =
        new Product(req.body);

        await product.save();

        res.json({
            message:
            "Product Added Successfully"
        });

    }catch(error){

        res.status(500).json(error);

    }

});

app.get("/products", async (req,res)=>{

    try{

        const products =
        await Product.find();

        res.json(products);

    }catch(error){

        res.status(500).json(error);

    }

});

app.delete("/delete-product/:id", async (req,res)=>{

    try{

        await Product.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message:
            "Product Deleted Successfully"
        });

    }catch(error){

        res.status(500).json(error);

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