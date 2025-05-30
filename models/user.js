const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
mongoose.connect(process.env.MONGOOSE_KRY);

const userschema = mongoose.Schema({
    name : String,
    email : String,
    password : String,
    profile : {
        type : String,
        default : 'defaultuser.jpg',
    },
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ]
})

module.exports = mongoose.model("user",userschema);