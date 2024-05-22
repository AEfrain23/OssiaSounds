import express from "express";
import bodyParser from "body-parser";
import 'dotenv/config'
import mongoose from "mongoose";
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_API_KEY);


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"));


// main().catch(err => console.log(err));
// async function main() {
//   await mongoose.connect("mongodb://localhost:27017/MerchDB");
// }

// const merchSchema = new mongoose.Schema({
//   name: String,
//   price: Number
// });

// const Merch = mongoose.model("Merch", merchSchema);

// const item1 = new Merch({
//   name: "OS001 T-Shirt",
//   price: 25000
// });
// const item2 = new Merch({
//   name: "OS002 T-Shirt",
//   price: 25000
// });
// const item3 = new Merch({
//   name: "OS003 T-Shirt",
//   price: 25000
// });

// // item1.save()
// // item2.save()
// // item3.save()

// const defaultItems = [item1, item2, item3];



// async function getItems() {
//   const items = await Merch.find({}); // Remember, in order to use await you must use async. This Finds ALL ITEMS???
//   console.log(items);
//   return items; // This function returns an array of all the data and we assign it the name 'Items'.
// }


const storeItems = new Map([
  [1, { priceInPence: 2500, name: "OS001 T-Shirt" },],
  [2, { priceInPence: 2500, name: "OS002 T-Shirt" },]
]);

console.log(storeItems);


// STRIPE FUNCTIONALITY:
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      mode: 'payment',
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInPence
          },
          quantity: item.quantity
        }
      }),
      shipping_address_collection: {
        allowed_countries: ['GB']
      },
      success_url: `${process.env.SERVER_URL}/success`,
      cancel_url: `${process.env.SERVER_URL}/cancel`
    })
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
});



app.use((req, res, next) => {
  res.locals.commonItem = "Hello";
  next();
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
  console.log("Server is runing on port 3000");
});