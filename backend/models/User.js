const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: String,

    lastName: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    verified: {
        type: Boolean,
        default: false
    }

});

module.exports =
mongoose.model("User", userSchema);