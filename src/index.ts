import Express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.route";
import { dataRouter } from "./routes/data.route";
import { verifyToken } from "./middleware/auth.middleware";

dotenv.config();

const app = Express();
app.use(Express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/data", verifyToken, dataRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is listening on port ${process.env.PORT || 3000}`);
});
