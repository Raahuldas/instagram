var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const localStrategy = require('passport-local');
const passport = require('passport');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}


router.post('/register',function(req,res){
  let userdata =new userModel({
    username: req.body.username,
    email: req.body.email,
    name:req.body.name
  });

  userModel.register(userdata,req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
})

router.post('/login',passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login"
}), function(req,res){ })

router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err) return next(err);
  })
  res.redirect("/login")
})

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.find().populate("user");
  res.render('feed', {footer: true,user,post});
});

router.get('/profile',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile', {footer: true,user});
});

router.get('/search',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render('search', {footer: true,user});
});

router.get('/edit',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render('edit', {footer: true,user});
});

router.get('/upload',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render('upload', {footer: true,user});
});

router.post('/update',isLoggedIn, upload.single('profileimage') ,async function(req,res){
  const user =await userModel.findOneAndUpdate(
    {username:req.session.passport.user},
    {username:req.body.username,name:req.body.name,bio:req.body.bio},
    {new:true}
    );

    if(req.file){
      user.profileimage = req.file.filename;
    }
  await user.save();
  res.redirect('/profile');
})

router.post("/upload",isLoggedIn, upload.single("postimage"),async function(req,res){
  const user = await userModel.findOne({username: req.session.passport.user });
  const post = await postModel.create({
  postimage: req.file.filename,
  caption: req.body.caption,
  user: user._id
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed");
})

router.get('/username/:username',isLoggedIn,async function(req, res) {
  const regex = new RegExp(`^${req.params.username}`,'i');
  const user = await userModel.find({username:regex});
  // console.log(user);
  res.json(user);
});

router.get('/like/post/:id',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});

  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id)
  } else{
    post.likes.splice(post.likes.indexOf(user._id),1)
  }
  await post.save();
  res.redirect('/feed');
})

router.get('/visit/profile/:userid',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const searcheduser = await userModel.findOne({_id:req.params.userid}).populate("posts");
  res.render('searchedprofile',{user,searcheduser,footer:true});
})

router.get('/view/post/:postid',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.postid}).populate("user");
  res.render('viewpost',{user,post,footer:true});
})

router.get('/changepassword',isLoggedIn,async function(req,res){
  res.render('changepassword',{footer:false})
});

router.post('/changepassword',isLoggedIn,async function(req,res,next){
  let user = req.user;
  await user.changePassword(req.body.currentpassword,req.body.newpassword, function(err){
    if(err){
      return next(err);
    }
    res.redirect("/profile");
  });
})

// router.post('/changepassword', isLoggedIn, async function(req, res) {
//   try {
//     // let userId = req.user._id; // Assuming user is authenticated and user object is available in req.user

//     // // Retrieve the user from the database
//     // let user = await userModel.findById(userId);
//     // console.log(userId);

//     const user = await userModel.findOne({username : req.session.passport.user})

//     // Check if the current password provided matches the user's current password
//     if (!user.authenticate(req.body.currentpassword)) {
//       return res.status(401).send("Current password is incorrect");
//     }

//     // Update the password in the database
//     await user.setPassword(req.body.newpassword);

//     // Save the user object with the new password
//     await user.save();

//     // Password updated successfully
//     return res.status(200).redirect("/profile");
//   } catch (error) {
//     // Handle any errors
//     console.error("Error:", error);
//     return res.status(500).send("Error updating password");
//   }
// });

module.exports = router;