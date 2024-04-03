const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    postimage:String,
    caption:String,
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ],
    createddate:{
        type:Date,
        default:Date.now()
    }
});

const postModel = mongoose.model("post",postSchema);

module.exports = postModel;