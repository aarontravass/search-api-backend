import express from "express";
import { customsearch } from "@googleapis/customsearch";
import { config } from "dotenv";
import isHtml from "is-html";
import rateLimit from 'express-rate-limit'

config();
const search = customsearch("v1");

const app = express();

app.get("/search", async (req, res) => {
  if (!req.query.query) {
    return res.status(400).send("Query is required");
  }
  if (typeof req.query.query !== "string" || isHtml(req.query.query)) {
    return res.status(400).send("Query must be a string and not html code");
  }
  const result = await search.cse.list({
    auth: process.env.API_KEY,
    q: req.query.query?.toString(),
    cx: process.env.SEARCH_ENGINE_ID,
  });
  return res.status(200).send(result.data);
});



// Apply the rate limiting middleware to all requests
app.use(rateLimit({
	windowMs: 30 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
}))

app.listen(parseInt(process.env.PORT || "3000"), () => {
  console.log("started listening");
});
