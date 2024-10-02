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
    // (Object.values(err.errors))
    // returns array of values
    // (Object.values(err.errors)).forEach(item=>{console.log(item.properties)})  // this returns 2 objects 
    (Object.values(err.errors)).forEach(item => {
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
// it takes any json data that comes along with a request and it parses it into a js object for us  
// post request lagegi so user wahan se data form main enter kar ke post request karega and data bejhega kya jo ke uske body main hoga suppose emain and password woh hum read kar payenge cause of this

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
const dbURI = 'mongodb+srv://lohanajaikumar5:lohanajaikumar16@cluster0.fi474.mongodb.net/node-auth';
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
      const user  =await User.login(email,password) //this static method didnt exist by default thats why was created by us
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
  // we actually want to delete the token inside the cookie but we cant do that so we would change token value and we can make it as anything an once we change token value its not going to get verified so we would have to login again
  res.cookie("nameofcookie2","",{expiresIn:1000})
  res.render ('logout')
})

// app.use(authRoutes)



// app.get('/set-cookies',(req,res)=>{
//   // res.setHeader('Set-Cookies','newUser=true') //second is the cookie name i,e newUser so new lagana hai har bar and value hai true  

//   res.cookie('newUser',false)
//   // will do same work as above line set a cookie and name newUser and value as false 
//   res.cookie('isEmployee',true,{maxAge:1000*60*60*24})
//   // 3rd argument can give as options object     .....by default maxAge is session  in options if we make secure:true so only when https would be there then it will be set otw not  
//   res.send("Cookies set page")
// })

// app.get("/read-cookies",(req,res)=>{
//     const cookies =req.cookies
//     console.log(cookies)

//     res.json(cookies)
// })




// server creates jwt which are stored in the browser as cookies jwt tocken contains encoded data about user to identify them  so for as long as they have this tocken in the cookie then they are considered authnticated and logged in 

// cookies are sent to the server by the browser for every request they make 

// for example request for /smoothies jwt tocken inside the cookie is sent to the server so when the server gets the tocken from the cookie in the request it can verify and decode it to identify the user so now if it is verified to be a valid tocken the user can be seen as logged in by the server and the server can then decide to show the user protected data or pages which require user to be authenticated if the tocken is missing or not valid the user is not authenticated and the server can send some kind of error or direct user to login page or something 