const app = require("./app");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");

//* Load ENV
const productionMode = process.env.NODE_ENV === "production";
if (!productionMode) {
  dotenv.config();
}

//* Database connection
async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected Successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`Error in DB connection ->`, err);
    process.exit(1);
  }
}

function startServer() {
  const port = +process.env.PORT || 4002;
  app.listen(port, () => {
    console.log(
      `Server running in ${
        productionMode ? "production" : "development"
      } mode on port ${port}`
    );
  });
}

async function run() {
  startServer();
  await connectToDB();
  // Folan()
}

run();
