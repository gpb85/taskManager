CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
    
)

CREATE TABLE tasks(
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,

)

//ενημέρωση πίνακα tasks με FOREIGN KEY employee_id
ALTRE TABLE tasks
ADD COLUMN employee_id REFERENCES employees(id) ON DELETE SET NULL;
