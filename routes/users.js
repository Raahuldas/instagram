const mongoose = require('mongoose');
const plm =require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/instagram");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  name:String,
  password: String,
  profileimage:String,
  bio:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }]
});

userSchema.plugin(plm);

module.exports =mongoose.model("user",userSchema);