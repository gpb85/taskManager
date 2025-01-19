import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

//database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "TaskManager",
  password: "12345",
  port: 5432,
});

db.connect();

//middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//get home page

app.get("/", async (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
