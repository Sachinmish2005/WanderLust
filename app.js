const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');
}


app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

app.engine('ejs',ejsMate);

app.get("/",async(req,res)=>{
  const allListings=await Listing.find({});
   res.render("listings/index",{allListings});
});

const validateListing=(req,res,next)=>{
  let (error)=listingSchema.validate(req.body);
  
  if(error){
    throw new ExpressError(400,result.error);
  }else{
    next();
  }
}





//Index Route
app.get("/listings",async (req,res)=>{
  const allListings=await Listing.find({});
   res.render("listings/index",{allListings});
});

//New Route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs")
});

//Show Route
app.get("/listings/:id",async(req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id);
res.render("listings/show.ejs",{listing});
});

// //Create Route
// app.post("/listings",async(req,res,next)=>{
//   try{
//  const newListing=new Listing(req.body.listing);
//  await newListing.save();
//  res.redirect("/listings");
// } catch(err){
//   next(err);
// }
// });

//Create Route
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
  listingSchema.validate(req.body);
  console.log(result);
  
 const newListing=new Listing(req.body.listing);
 await newListing.save();
 res.redirect("/listings");

}));

//Edit Route

app.get("/listings/:id/edit",async(req,res)=>{
let {id}=req.params;
const listing=await Listing.findById(id);
res.render("listings/edit.ejs",{listing});
});


//Update Route
app.put("/listings/:id",validateListing,async(req,res)=>{
  let{id}=req.params;
  await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id",wrapAsync( async(req,res)=>{
  let{id}=req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));












// app.get("/testListing",async(req,res)=>{
//   let sampleListing=new Listing({
//     title:"My New Villa",
//     description:"By the beach",
//     price:1200,
//     location:"Calangute,Goa",
//     country:"India",
//   });
// // await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });





app.use((err,req,res,next)=>{
  let {statusCode,message}=err;
  res.render("error.ejs",{message});
  // res.status(statusCode).send(message);
});







app.listen(8080,()=>{
  console.log("server is listeing to port 8080");
});