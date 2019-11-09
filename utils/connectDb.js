const mongoose = require("mongoose");

const connectDb = async () => {
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
};

module.exports = connectDb;
