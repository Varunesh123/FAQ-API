import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/utils/app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
