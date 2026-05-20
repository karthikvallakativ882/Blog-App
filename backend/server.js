import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { userRoute } from "./APIs/UserApi.js";
import cookieParser from "cookie-parser";
import { adminRoute } from "./APIs/AdminAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { commonRouter } from "./APIs/CommonAPI.js";
import cors from 'cors'  ;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
  path: path.resolve(__dirname, ".env"),
  quiet: true,
}); //process.env

const localOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const configuredOrigins = (process.env.CLIENT_URLS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);
const dbUrl = process.env.DB_URL?.trim().replace(/^['"]|['"]$/g, "");
const port = Number(process.env.PORT) || 4000;

//Create express application
const app = exp();
//cors 
app.use(cors({
  origin(origin, callback) {
    if (!origin || localOriginPattern.test(origin) || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin ${origin}`));
  },
  credentials: true,
}));
//add body parser middleware
app.use(exp.json());
//add cookie parser middleware
app.use(cookieParser())
//connect APIs

app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/Common-api",commonRouter);

//connect to db
const connectDB = async () => {
  try {
    if (!dbUrl) {
      console.log("Missing DB_URL environment variable");
      return;
    }

    if (!/^mongodb(\+srv)?:\/\//.test(dbUrl)) {
      console.log("Invalid DB_URL. It must start with mongodb:// or mongodb+srv://");
      return;
    }

    await connect(dbUrl);
    console.log("DB connection success");
  } catch (err) {
    console.log("Err in DB connection:", err);
  }
};

//start http server immediately
app.listen(port, () => {
  console.log(`server started on port ${port}`);
  connectDB();
});



app.use((err, req, res, next) => {

  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Full error:", err);

  // mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Profile image must be 2MB or smaller"
        : err.message;

    return res.status(400).json({
      message: "error occurred",
      error: message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  // ✅ HANDLE CUSTOM ERRORS
  if (err.status) {
    return res.status(err.status).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // default server error
  res.status(500).json({
    message: "error occurred",
    error: "Server side error",
  });
});
