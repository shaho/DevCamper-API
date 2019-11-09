const mongoose = require("mongoose");

const connection = {};

const connectDb = async () => {
  if (connection.isConnected) {
    console.log("Using existing connection".rainbow);
    return;
  }

  const db = await mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(
    `-----------------------------------------------------------------\n MongoDB Connected: ${db.connection.host}\n-----------------------------------------------------------------
    `.cyan,
  );
  connection.isConnected = db.connections[0].readyState;
};

module.exports = connectDb;
