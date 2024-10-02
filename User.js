const mongoose=require('mongoose');
const {isEmail} =require('validator')
const bcrypt=require('bcrypt')
const userSchema=new mongoose.Schema({
  email:{
    type:String,
    required:[true,'Email is required'],
    unique:[true,'Already Exists'],
    lowercase:true,
    validate:[isEmail,"Please Enter a Valid Email"]
  },
  password:{
    type:String,
    required:[true,'Password is Required'],
    minlength:[6,'Minimum length of Password should be 6 characters']
  }  
})

// fire a function after doc is saved to the db
userSchema.post('save',function(doc,next){
  console.log(`new user was created and saved ${doc}`)
  next()
})
// here post means do someting after something happens so post that do this .............  and does not refer to post request 



//  fire a function before a doc is saved to the db 
userSchema.pre('save',async function(next){
  console.log("user about to be created and saved",this.email,this.password,this.id)  
  const salt =await bcrypt.genSalt()
  this.password=await bcrypt.hash(this.password,salt)
  next()
  
  // cant use arrow function here and only next is given doc is not cause before doc is created this runs and locally email and password variables were created and so those are reffered as this.email and this.password

  // To access the document (this) inside Mongoose middleware, you need to use a regular function rather than an arrow function, because regular functions correctly bind this to the document being saved.

})


// static method to login user 
userSchema.statics.login=async function(email1,password1){
    const user = await this.findOne({email:email1})
    if(user){
      const auth = await bcrypt.compare(password1,user.password)
      if(auth){
        return user
      }
      throw Error("Incorrect Password")
      
      
    }
    throw Error("Incorrect Email")
}

// password1 is not hashed but bcrypt will do that hashing by its own and then would compare both the hashed values


const User=mongoose.model('user',userSchema)
// have named collection as users that is compoulsory and have named here as user thats also compulsory
module.exports=User