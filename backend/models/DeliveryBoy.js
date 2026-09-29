const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({

    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },  // bcrypt hashed

    vehicleType: {
        type: String,
        enum: ["Bike", "Bicycle", "Van", "Auto"],
        default: "Bike"
    },

    vehicleNumber: String,

    isActive: { type: Boolean, default: true },

    currentLocation: String,

    totalDeliveries: { type: Number, default: 0 },

    rating: { type: Number, default: 5.0 },

    createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);
