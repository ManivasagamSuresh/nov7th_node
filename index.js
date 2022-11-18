const express = require("express");
const ENV = require("dotenv").config()
const cors =require("cors");
const mongodb=require("mongodb");
// const mongoclient = mongodb.MongoClient();
const app = express();
const URL = process.env.DB;   //mongodb://localhost:27017
const mongoclient = new mongodb.MongoClient(URL)
// const nodemon = require("nodemon")
const bcrypt = require("bcryptjs")
const jwt=require("jsonwebtoken")
const JWT_Secret=process.env.JWT_Secret;
const nodemailer = require("nodemailer") ;
const JWT_pass=process.env.JWT_pass;

app.use(cors({
    origin: "https://cosmic-narwhal-c03b73.netlify.app"
    // origin: "http://localhost:3000"

}))
app.use(express.json())


// authorize function
let authorize = (req, res, next) => {
    try {
      // Check if authorization token present
    //   console.log(req.headers.authorization);
      if (req.headers.authorization) {
        // Check if the token is valid
        let decodedToken = jwt.verify(req.headers.authorization,JWT_Secret);
        if (decodedToken) {
          next();
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
        // if valid say next()
        // if not valid say unauthorized
      }
    } catch (error) {
      res.status(401).json({ message: "Unauthorized for you" });
    }
  };
  

products=[];





//register
app.post("/user/register",async(req,res)=>{
    try{
        const connection = await mongoclient.connect()
    
        const db = connection.db("nov7th");

        var salt = await bcrypt.genSalt(10);
        // console.log(salt);
        var hash=await bcrypt.hash(req.body.password,salt);
        // console.log(hash);
        req.body.password=hash;
    
        const p = await db.collection("users").insertOne(req.body);
    
        await connection.close()
    
        res.json({message:"User created"}); 
    }
    catch(err){
        console.log(err);
        res.json({message:"error"});
    
    }
        
    })


//login
    app.post("/user/login",async(req,res)=>{
        try{
            const connection = await mongoclient.connect()
        
            const db = connection.db("nov7th");
        
            const user = await db.collection("users").findOne({email:req.body.email});
            if(user){
                const compare = await bcrypt.compare(req.body.password,user.password);
               if(compare){
                const token =jwt.sign({_id:user._id},JWT_Secret,{expiresIn:"24hr"})
                res.json({message:"success",
                _id:user._id,
                token});
                 }else{
                 res.json({message:"incorrect mail/password"})
                        }
                    }
                    else{
                        res.status(404).json({message:"incorrect mail/password"})
                    }
            await connection.close()
        
            // res.json({message:"User created"}); 
        }
        catch(err){
            console.log(err);
            res.json({message:"error"});
        
        }
            
        })


// view users
app.get("/users",async(req,res)=>{
    try{
        const connection = await mongoclient.connect()
    
        const db = connection.db("nov7th");
    
        const p = await db.collection("users").find({}).toArray();;
    
        await connection.close()
    
        res.json(p); 
    }
    catch(err){
        console.log(err);
        res.json({message:"error"});
    
    }
        
    })
    
    // check if mail exists
    app.post("/users/checkmail",async(req,res)=>{
        try{
            const connection = await mongoclient.connect();
        
            const db = connection.db("nov7th");
        
            const p = await db.collection("users").findOne({email:req.body.email});
        
            await connection.close()
        
            res.json(p); 
        }
        catch(err){
            console.log(err);
            res.json({message:"error"});
        
        }
            
        })
    
// sending mail
 app.post("/sendMail/:id",async(req,res)=>{
                
const transporter = nodemailer.createTransport(
    {
    service:"hotmail",
    auth:{
        user:"manivasagam.suresh@outlook.com",
        pass:"atshu.mani"
    }
});

const details = {
    from: "manivasagam.suresh@outlook.com",
    to:`${req.body.email}`,
    subject:"sending from node.js",
    text:`hi .please click the below link to change your password,For Login use the following temp password " ${JWT_pass} " `,
    html: `<p>hi .please click the below link to change your password,For Login use the following temp password " ${JWT_pass} " </p>
    <a href=http://localhost:3000/LoginPass>Click Here</a>`

};
transporter.sendMail(details,(err,info)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log("sent:" + info.response);

}) 
            })



  
  // setting temp pass
            app.put("/tempPassChange/:id",async(req,res)=>{
                try{
                    const connection = await mongoclient.connect()
                
                    const db = connection.db("nov7th");

                    var salt = await bcrypt.genSalt(5);
        // console.log(salt);
        var hash=await bcrypt.hash(JWT_pass,salt);
        // console.log(hash);
        let tempPassword=hash;
            
                    const p = await db.collection("users")
                                        .updateOne({_id:mongodb.ObjectId(req.params.id)},{$set:{password:tempPassword}});
                
                    await connection.close()
                
                    res.json(p); 
                    console.log("temp password changed")
                }
                catch(err){
                    console.log(err);
                    res.json({message:"error"});
                
                }
                  
               
                
            }) 






// changing password
            app.put("/passChange/:id",async(req,res)=>{
                try{
                    const connection = await mongoclient.connect()
                
                    const db = connection.db("nov7th");

                    var salt = await bcrypt.genSalt(10);
        // console.log(salt);
        var hash=await bcrypt.hash(req.body.confirmpassword,salt);
        // console.log(hash);
        let Pass=hash;

            
                    const p = await db.collection("users")
                                        .updateOne({_id:mongodb.ObjectId(req.params.id)},{$set:{password:Pass}});
                
                    await connection.close()
                
                    res.json(p); 
                }
                catch(err){
                    console.log(err);
                    res.json({message:"error"});
                
                }
                  
               
                
            }) 







    
// app.post("/create-product",(req,res)=>{
//     req.body.id=products.length+1;
//     products.push(req.body)
//     res.json({message:"created",id:products.length});
// })


//createproduct
app.post("/create-product",authorize,async(req,res)=>{
try{
    const connection = await mongoclient.connect()

    const db = connection.db("nov7th");

    const p = await db.collection("products").insertOne(req.body);

    await connection.close()

    res.json({message:"created",_id :p.insertedId}); 
}
catch(err){
    console.log(err);
    res.json({message:"error"});

}
    
})



// app.get("/products",(req,res)=>{
//     res.json(products);
    
// })

app.get("/products",async(req,res)=>{
    try{
        const connection = await mongoclient.connect()
    
        const db = connection.db("nov7th");
    
        const p = await db.collection("products").find({}).toArray();;
    
        await connection.close()
    
        res.json(p); 
    }
    catch(err){
        console.log(err);
        res.json({message:"error"});
    
    }
        
    })
    
    
    


// app.get("/product/:id",(req,res)=>{
//     let ProductId=req.params.id;
//     let index= products.findIndex((prod)=>prod.id==ProductId);
//     res.json(products[index]);
    
// })



app.get("/product/:id",async(req,res)=>{
    try{
        const connection = await mongoclient.connect()
    
        const db = connection.db("nov7th");
    
        const p = await db.collection("products").findOne({_id:mongodb.ObjectId(req.params.id)});    
        await connection.close()
    
        res.json(p); 
    }
    catch(err){
        console.log(err);
        res.json({message:"error"});
    
    }
})




// app.put("/product/:id",(req,res)=>{
//     let ProductId=req.params.id;
//     let index= products.findIndex((prod)=>prod.id==ProductId);
//     if(index != -1){
//         const keys = Object.keys(req.body);
//     keys.forEach((a) => {
//         products[index][a]=req.body[a]
//     });
//     // console.log(ProductId);
//     // console.log(req.body) 
//     res.json({message:"edited"})
//     }
//     else{
//         res.status(404).json({message:"not found"})
//     }
// }) 



app.put("/product/:id",async(req,res)=>{
    try{
        const connection = await mongoclient.connect()
    
        const db = connection.db("nov7th");
        
        delete req.body._id;

        const p = await db.collection("products")
                            .updateOne({_id:mongodb.ObjectId(req.params.id)},{$set:req.body});
    
        await connection.close()
    
        res.json(p); 
    }
    catch(err){
        console.log(err);
        res.json({message:"error"});
    
    }
      
   
    
}) 




// app.delete("/product/:id",(req,res)=>{
//     let ProductId=req.params.id;
//     let index= products.findIndex((prod)=>prod.id==ProductId);
//     products.splice(index,1);
//     res.json({message:"deleted"})
// })



app.delete("/product/:id",async(req,res)=>{
    try{
        const connection = await mongoclient.connect()
    
        const db = connection.db("nov7th");
    
        const p = await db.collection("products").deleteOne({_id:mongodb.ObjectId(req.params.id)});
    
        await connection.close()
    
        res.json(p); 
    }
    catch(err){
        console.log(err);
        res.json({message:"error"});
    
    }
      

})














// app.post("/forgotPassword",async(req,res)=>{ 
//   try{
//     let testAccount = await nodemailer.createTestAccount();


//     let transporter = nodemailer.createTransport({
//       host: "smtp.ethereal.email",
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: "s.kishore123.64@gmail.com" , // generated ethereal user
//         pass: "atshu.mani", // generated ethereal password
//       },
//     });
  
   
//     let info = await transporter.sendMail({
//       from: '"Mani 👻" <s.kishore123.64@gmail.com>', // sender address
//       to: "atshaya1999@gmail.com, mani.mb@gmail.com", // list of receivers
//       subject: "Hello ✔", // Subject line
//       text: "first", // plain text body
//       html: "<b>Hello world?</b>", // html body
//     });
  
//     console.log("Message sent: %s", info.messageId);
//     res.json({message:"mail sent"})
// }

//     catch(error){
//         console.log(error)
//   }

//   }

// )






console.log('started');
app.listen(process.env.PORT || 3003);


