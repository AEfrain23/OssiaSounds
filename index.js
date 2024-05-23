import express from "express";
import bodyParser from "body-parser";
import 'dotenv/config'
import mongoose from "mongoose";
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_API_KEY);


const app = express();
const port = 3005;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"));


main().catch(err => console.log(err));
async function main() {
  await mongoose.connect("mongodb://localhost:27017/MerchDB");
}

const merchSchema = new mongoose.Schema({
  itemNumber: Number,
  name: String,
  price: Number
});

const Merch = mongoose.model("Merch", merchSchema);

const item1 = new Merch({
  itemNumber: 1,
  name: "OS001 T-Shirt",
  price: 2500
});
const item2 = new Merch({
  itemNumber: 2,
  name: "OS002 T-Shirt",
  price: 2500
});
const item3 = new Merch({
  itemNumber: 3,
  name: "OS003 T-Shirt",
  price: 2500
});

// item1.save()
// item2.save()
// item3.save()

const defaultItems = [item1, item2, item3];


function getItems() {
  let items = Merch.find({}); // Remember, in order to use await you must use async. This Finds ALL ITEMS???
  return items; // This function returns an array of all the data and we assign it the name 'Items'.
}


// const storeItems = new Map([
//   [1, { priceInPence: 2500, name: "OS001 T-Shirt" },],
//   [2, { priceInPence: 2500, name: "OS002 T-Shirt" },]
// ]);



// STRIPE FUNCTIONALITY:
app.post("/create-checkout-session", async (req, res) => {
  try {

    const { items } = req.body;

    const validItems = items.filter(item => item.quantity > 0);
    // 'filter' creates a new array with all elements that pass the test implemented by the provided function. It 
    // iterates over each element of the array and checks whether it satisfies the condition specified in the function 
    // passed to it.
    

    const lineItemsPromises = validItems.map(async (item) => {     // lineItemsPromises is going to be an array of promises.
      const product = await Merch.findById(item.id);
      if (!product) {
        throw new Error(`Item with id ${item.id} not found`);
      }
      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    });

    const lineItems = await Promise.all(lineItemsPromises);
    // Promise.all returns a single promise that resolves when all of the promises in the array have resolved.

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['GB']
      },
      success_url: `${process.env.SERVER_URL}/success`,
      cancel_url: `${process.env.SERVER_URL}/`
    })
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
});


app.use(async (req, res, next) => {
  try {
    const products = await Merch.find({});
    res.locals.commonItem = products;
    next();
  } catch (e) {
    console.error(e);
    next(e);
  }
});


app.get("/", (req, res) => {
  res.render("index.ejs")
});

app.get("/events", (req, res) => {
  res.render("events.ejs");
});

app.get("/merch", (req, res) => {
  res.render("merch.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});


app.listen(port, () => {
  console.log("Server is runing on port 3005");
});