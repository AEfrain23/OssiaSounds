import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';  // Importing CORS middleware
import fetch from 'node-fetch';  // node-fetch v2 // For sending requests to reCAPTCHA API
import 'dotenv/config'
import mongoose from "mongoose";
import Stripe from 'stripe';
import nodemailer from 'nodemailer';


mongoose.connect(`${process.env.MONGO_DB}`);


const stripe = new Stripe(process.env.STRIPE_API_KEY);


const app = express();
const port = 3005;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static("public"));


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



// Route to handle form submission and reCAPTCHA validation
app.post("/send-message", (req, res) => {
  const { firstName, secondName, customerEmail, customerMessage, 'g-recaptcha-response': captchaResponse } = req.body;

  // Step 1: Verify reCAPTCHA response with Google
  const secretKey = process.env.RECAPTCHA_KEY;  // Store this in your .env file

  const params = new URLSearchParams({
    secret: secretKey,
    response: captchaResponse,
    remoteip: req.ip,
  });

  fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params,
  })
    .then(response => response.json())
    .then(data => {
      // Step 2: If reCAPTCHA validation is successful, send the email
      if (data.success) {
        console.log("Successful reCAPTCHA validation");

        let transporter = nodemailer.createTransport({
          host: 'smtp-relay.sendinblue.com',
          port: 587,
          auth: {
            user: "angelefrain23@gmail.com",  // Your email
            pass: process.env.SMTP_KEY,   // Your SMTP key
          },
        });

        const message = {
          from: customerEmail,
          to: "support@ossiasounds.com",
          subject: `ossiasounds.com - ${firstName} ${secondName}`,
          text: `Customer Name: ${firstName} ${secondName}\nCustomer Message: ${customerMessage}`,  // Use newlines for clarity
        };

        // Send the email using Nodemailer
        transporter.sendMail(message, (err, info) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error sending email" });
          } else {
            console.log(info);
            const emailSent = "Email sent successfully";
            const textResponse = "Thank you for you message.";
            // Step 3: Render the confirmation page with a success message
            res.render("contact.ejs", { confirmation: emailSent, message: textResponse });  // Render the EJS page with the confirmation message
            // IMPORTAT: For some reason the following extra code in contact.ejs makes the whole pop up message non-functional.
            //          <% if (locals.message) { %>
            //          <p style="color: white;"><%- message %></p>
            //          <% } %>
          }
        });

      } else {
        // If reCAPTCHA failed, render the contact page with an error message
        const errorMessage = "reCAPTCHA validation failed";
        const textResponse = "Please try again.";
        console.log("reCAPTCHA validation failed.");
        res.render("contact.ejs", { confirmation: errorMessage, message: textResponse });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error validating reCAPTCHA" });
    });
});


app.listen(port, () => {
  console.log("Server is runing on port 3005");
});