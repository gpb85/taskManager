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

app.get("/", async (req, res) => {
  try {
    const employeesResult = await db.query(
      "SELECT * FROM employees ORDER  BY id ASC"
    );
    const employees = employeesResult.rows;
    const tasksResult = await db.query("SELECT * FROM tasks ORDER BY id ASC");
    const tasks = tasksResult.rows;
    res.render("admin.ejs", {
      listEmployeeTitle: "Admin Window",
      listEmployees: employees,
      listTasks: tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while fetching data");
  }
});

app.post("/editEmployee", async (req, res) => {
  const name = req.body.updatedEmployeeName;
  const id = req.body.updatedEmployeeId;
  try {
    await db.query("UPDATE employees SET name=($1) WHERE id=$2", [name, id]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.post("/delete-employee", async (req, res) => {
  const id = req.body.deleteEmployeeId;
  try {
    await db.query("DELETE FROM employees WHERE id=$1", [id]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.post("/add-employee", async (req, res) => {
  const employee = req.body.newEmployee;
  try {
    await db.query("INSERT INTO employees (name) VALUES($1)", [employee]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.post("/edit-task", async (req, res) => {
  const title = req.body.updatedTaskTitle;
  const id = req.body.updatedTaskId;
  try {
    await db.query("UPDATE tasks SET title=($1) WHERE id=$2", [title, id]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
