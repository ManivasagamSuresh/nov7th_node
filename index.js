const express = require("express");
const ENV = require("dotenv").config()
const cors =require("cors");
const mongodb=require("mongodb");
// const mongoclient = mongodb.MongoClient();
const app = express();
const URL = process.env.DB;   //mongodb://localhost:27017
const mongoclient = new mongodb.MongoClient(URL)
// const nodemon = require("nodemon")

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(express.json())

products=[];

// app.post("/create-product",(req,res)=>{
//     req.body.id=products.length+1;
//     products.push(req.body)
//     res.json({message:"created",id:products.length});
// })

app.post("/create-product",async(req,res)=>{
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



console.log('started');
app.listen(process.env.PORT || 3003);


