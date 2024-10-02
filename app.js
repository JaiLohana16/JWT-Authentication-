const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const User = require('../JWT/models/User')
const app = express();
const cookieParser =require('cookie-parser')
const jwt=require('jsonwebtoken')



function handleError(err) {
  let error = { email: '', password: '' }
  console.log(err.message,err.code)
  if (err.message.includes('user validation failed')) {
      const x = item.properties
      error[x.path] = x.message
    })
  }

  // duplicate entry error to be shown to user code
  if(err.code==11000){
    error.email="User already exist with same Email"
    return error;
  }

  if(err.message=="Incorrect Email"){
    error.email="Incorrect Email Please Try again"
    return error
  }

  if(err.message =="Incorrect Password"){
    error.password="Incorrect Password Please Try again"
    return error
  }

  return error;
}
const maxAge=3*24*60*60
function createToken(id){
  return jwt.sign({id},'this is my secret and id is the payload i dont have to publish this secret anywhere',{
    expiresIn:maxAge})
}

// Middleware

app.use(express.static('public'));


app.use(express.json())

app.use(cookieParser())

// custom middleware 

// protecting the routes need to login first or signup first all other routes are protected and are available only when user is logged in 
const requireAuth=(req,res,next)=>{
  const token = req.cookies.nameofcookie2

  if(token){
    jwt.verify(token,'this is my secret and id is the payload i dont have to publish this secret anywhere',(error,decodedToken)=>{
      if(error){
        res.render('/login')
      }
      else{
        console.log(decodedToken,"is decoded tocken")
        next() 
      }
    })
    
  }

  else{
    res.redirect('/login')
  }
}



// check current user 

function currentUser(req,res,next){
  const token =req.cookies.nameofcookie2
  if(token){
    jwt.verify(token,'this is my secret and id is the payload i dont have to publish this secret anywhere',async(error,decodedToken)=>{
      if(error){
        res.locals.user=null
        next()
      }
      else{
        console.log(decodedToken,"is decoded tocken")
        let user = await User.findById(decodedToken.id)
        res.locals.user=user
        next() 
      }
    })
    
  }
  // else means we are not logged in
  else{
    res.locals.user=null
    next()
  }

}


//  Middleware to redirect if the user is already logged in
const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.nameofcookie2;

  if (token) {
    jwt.verify(token, 'this is my secret and id is the payload i dont have to publish this secret anywhere', (error, decodedToken) => {
      if (error) {
        next(); // Invalid token, allow access to login or signup
      } else {
        // User is logged in, redirect them to another page (e.g., home)
        res.redirect('/');
      }
    });
  } else {
    // No token found, user is not logged in, proceed
    next();
  }
  
};



// View engine
app.set('view engine', 'ejs');


// Database connection
const dbURI = 'mongodb+srv://lohanajaikumar5:<dbPassword>@cluster0.fi474.mongodb.net/node-auth';
mongoose.connect(dbURI)
  .then((result) => {
    app.listen(3000, () => {
      console.log("The app is running on port 3000");
    });
  })
  .catch((err) => console.log(err));


// Routes

app.get('*',currentUser)

app.get('/',requireAuth, (req, res) => res.render('home'));

app.get('/smoothies', requireAuth,(req, res) => res.render('smoothies'));

// authRoutes

app.get('/login', redirectIfLoggedIn,(req, res) => { res.render('login') })

app.get('/signup',redirectIfLoggedIn, (req, res) => { res.render('signup') })

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try{
      const user  =await User.login(email,password) 
      const token=createToken(user._id)
      res.cookie("nameofcookie2",token,{maxAge:maxAge*1000}) 
      res.status(200).json({user:user._id})
  }
  catch(err){
    res.status(400).json(handleError(err))
  }
})

app.post('/signup', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.create({ email, password })
    const token=createToken(user._id)
    res.cookie("nameofcookie",token,{maxAge:maxAge*1000})
    res.status(200).json({user:user._id})
    console.log(user)
  }
  catch (err) {
    console.log(handleError(err))
    res.status(400).json(handleError(err))
  }
})


app.get('/logout',(req,res)=>{
  res.cookie("nameofcookie2","",{expiresIn:1000})
  res.render ('logout')
})
