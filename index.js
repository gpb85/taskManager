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
    // Ανάκτηση υπαλλήλων
    const employeesResult = await db.query(
      "SELECT * FROM employees ORDER  BY id ASC"
    );
    const employees = employeesResult.rows;

    // Ανάκτηση μη ανατεθειμένων tasks
    const tasksResult = await db.query(
      "SELECT tasks.*, employees.name AS employee_name FROM tasks LEFT JOIN employees ON tasks.employee_id = employees.id WHERE tasks.employee_id IS NULL ORDER BY tasks.id ASC"
    );
    const tasks = tasksResult.rows;

    // Ανάκτηση εργασιών ανά υπάλληλο
    const employeeTasks = await db.query(
      "SELECT employees.name, tasks.title FROM tasks JOIN employees ON tasks.employee_id = employees.id ORDER BY employees.name"
    );
    const tasksByEmployee = employeeTasks.rows;

    // Απόδοση δεδομένων στη σελίδα
    res.render("admin.ejs", {
      listEmployeeTitle: "Admin Window",
      listEmployees: employees,
      listTasks: tasks, // Περιλαμβάνει μόνο μη ανατεθειμένα tasks
      tasksByEmployee: tasksByEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
});

//employee

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

//task

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

app.post("/delete-task", async (req, res) => {
  const id = req.body.deleteTaskId;
  try {
    await db.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.post("/add-task", async (req, res) => {
  const task = req.body.newTask;
  try {
    await db.query("INSERT INTO tasks (title) VALUES($1)", [task]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

//task-employee

app.post("/assign-task", async (req, res) => {
  const { taskId, employeeId } = req.body;
  if (!taskId || !employeeId) {
    return res.status(400).send("Both task ID and employee ID are required.");
  }
  try {
    await db.query("UPDATE tasks SET employee_id=$1 WHERE id=$2", [
      employeeId,
      taskId,
    ]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while assigning the task");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
