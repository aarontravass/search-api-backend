import express from "express";
import { customsearch } from "@googleapis/customsearch";
import { config } from "dotenv";
import isHtml from "is-html";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import csurf from "csurf";

class ErrorModel {
  code: string;
  message: string;
}
class ResponseModel {
  success: boolean;
  statusCode: number;
  error: ErrorModel;
  message: string;
  data: any;
}

config();
const search = customsearch("v1");
const csrfProtection = csurf({ cookie: true });

const app = express();
app.use(cookieParser());
app.use(csrfProtection);
app.get("/search", async (req, res) => {
  const response = new ResponseModel();
  const error = new ErrorModel();
  response.success = false;
  if (!req.query.query) {
    response.statusCode = 400;
    error.code = "REQ_101";
    error.message = "Query is required";
    response.error = error;
    return res.status(response.statusCode).json(response);
  }
  if (typeof req.query.query !== "string" || isHtml(req.query.query)) {
    response.statusCode = 400;
    error.code = "REQ_102";
    error.message = "Query must be a string and not html code";
    response.error = error;
    return res.status(response.statusCode).json(response);
  }
  if (req.query.query.length > 100) {
    response.statusCode = 400;
    error.code = "REQ_103";
    error.message = "Query length must be less than 100 characters";
    response.error = error;
    return res.status(response.statusCode).json(response);
  }
  if (req.query.start) {
    if (
      typeof req.query.start != "string" ||
      isNaN(parseInt(req.query.start))
    ) {
      response.statusCode = 400;
      error.code = "REQ_104";
      error.message = "start should be a number string";
      response.error = error;
      return res.status(response.statusCode).json(response);
    }
    if (parseInt(req.query.start) <= 0 || parseInt(req.query.start) >= 100) {
      response.statusCode = 400;
      error.code = "REQ_105";
      error.message = "start should be between 1 and 99";
      response.error = error;
      return res.status(response.statusCode).json(response);
    }
  }
  const result = await search.cse.list({
    auth: process.env.API_KEY,
    q: req.query.query?.toString(),
    cx: process.env.SEARCH_ENGINE_ID,
    start: parseInt(req.query.start.toString()),
  });
  response.statusCode = 200;
  response.success = true;
  response.data = result.data;
  return res.status(response.statusCode).send(response);
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
