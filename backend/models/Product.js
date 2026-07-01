const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: String,

    price: Number,

    images: [String],

    category: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
mongoose.model(
    "Product",
    productSchema
);