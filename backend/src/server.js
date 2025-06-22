import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT || 5002;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Environment:", process.env.NODE_ENV || "development");
});
