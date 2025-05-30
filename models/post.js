const mongoose = require('mongoose');

// mongoose.connect("mongodb://localhost:27017/miniproject");

const postschema = mongoose.Schema({
    content : String,
    like : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }
    ],
    date : {
        type : Date,
        default : Date.Now,
    },
    users : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }
    ]
})

module.exports = mongoose.model("post",postschema);