const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema({

    email:{
        type:String,
        required:true
    },

    loginTime:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.model(
    "LoginHistory",
    LoginHistorySchema
);