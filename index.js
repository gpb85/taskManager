import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "TaskManager",
  password: "12345",
  port: 5432,
});

db.connect();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// GET: Employee tasks page
app.get("/employee-tasks", async (req, res) => {
  try {
    const employeesResult = await db.query(
      "SELECT * FROM employees ORDER BY id ASC"
    );
    const employees = employeesResult.rows;

    const employeesTasks = await db.query(
      "SELECT employees.name AS employee_name, tasks.title FROM tasks JOIN employees ON tasks.employee_id = employees.id ORDER BY employees.name"
    );
    const tasksByEmployee = employeesTasks.rows;

    res.render("index.ejs", {
      listEmployees: employees,
      tasksByEmployee: tasksByEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
});

// GET: Admin page
app.get("/", async (req, res) => {
  try {
    // Fetch employees
    const employeesResult = await db.query(
      "SELECT * FROM employees ORDER BY id ASC"
    );
    const employees = employeesResult.rows;

    // Fetch unassigned tasks
    const tasksResult = await db.query(
      "SELECT tasks.*, employees.name AS employee_name FROM tasks LEFT JOIN employees ON tasks.employee_id = employees.id WHERE tasks.employee_id IS NULL ORDER BY tasks.id ASC"
    );
    const tasks = tasksResult.rows;

    // Fetch tasks by employee
    const employeeTasks = await db.query(
      "SELECT employees.name, tasks.title FROM tasks JOIN employees ON tasks.employee_id = employees.id ORDER BY employees.name"
    );
    const tasksByEmployee = employeeTasks.rows;

    // Render the admin page
    res.render("admin.ejs", {
      listEmployeeTitle: "Admin Window",
      listEmployees: employees,
      listTasks: tasks, // Only unassigned tasks
      tasksByEmployee: tasksByEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
});

app.post("/toggle-task-status", async (req, res) => {
  const taskId = req.body.taskId;
  const taskStatus = req.body.taskStatus === "true"; // Αν το checkbox είναι τσεκαρισμένο, taskStatus = true
  console.log("taskId:", taskId); // Θα πρέπει να δεις το taskId
  console.log("taskStatus:", taskStatus); // Θα πρέπει να δεις το taskStatus (true ή false)

  if (!taskId) {
    console.error("No taskId provided.");
    return res.status(400).send("Task ID is required.");
  }

  try {
    const tasksResult = await db.query(
      "SELECT completed FROM tasks WHERE id=$1",
      [taskId]
    );
    const task = tasksResult.rows[0];

    if (!task) {
      console.error("Task not found.");
      return res.status(404).send("Task not found.");
    }

    // Ενημερώνουμε την κατάσταση του task στη βάση δεδομένων
    await db.query("UPDATE tasks SET completed=$1 WHERE id=$2", [
      taskStatus,
      taskId,
    ]);

    res.redirect("/employee-tasks");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating task status");
  }
});

// Employee routes
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

// Task routes
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

// Assign task to employee
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
    res.status(500).send("An error occurred while assigning the task");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
