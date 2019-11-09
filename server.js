const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

const connrctDb = require("./utils/connectDb");
// Route files
const bootcamps = require("./routes/bootcamps");
// Load env vars
dotenv.config({ path: "config.env" });
// Connect to database
connrctDb();

const app = express();
// Body parser
app.use(express.json());
// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold,
  ),
);

// Handle unhandled promise rejection
process.on("unhandledRejection", (error, promise) => {
  console.log(`Error ${error.message}`.red);
  // Close server and exit proccess
  server.close(() => process.exit(1));
});
