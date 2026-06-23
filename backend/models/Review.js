const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

    product:{
        type:String,
        required:true
    },

    user:{
        type:String,
        required:true
    },

    rating:{
        type:Number,
        required:true
    },

    review:{
        type:String,
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.model(
    "Review",
    reviewSchema
);
