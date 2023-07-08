import express from "express";
import { customsearch } from "@googleapis/customsearch";
import { config } from "dotenv";
import isHtml from "is-html";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import csurf from "csurf";

config();
const search = customsearch("v1");
const csrfProtection = csurf({ cookie: true });

const app = express();
app.use(cookieParser());
app.use(csrfProtection);
app.get("/search", async (req, res) => {
  if (!req.query.query) {
    return res.status(400).send("Query is required");
  }
  if (typeof req.query.query !== "string" || isHtml(req.query.query)) {
    return res.status(400).send("Query must be a string and not html code");
  }
  if (req.query.query.length > 100) {
    return res
      .status(400)
      .send("Query length must be less than 100 characters");
  }
  const result = await search.cse.list({
    auth: process.env.API_KEY,
    q: req.query.query?.toString(),
    cx: process.env.SEARCH_ENGINE_ID,
    start: parseInt(req.query.start.toString())
  });
  return res.status(200).send(result.data);
});

// Apply the rate limiting middleware to all requests
app.use(
  rateLimit({
    windowMs: 30 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  })
);

app.listen(parseInt(process.env.PORT || "3000"), () => {
  console.log("started listening");
});
