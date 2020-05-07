const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

let employeeArray = [];
let regexStrings = new RegExp("^[a-zA-Z ]*$");
let regexNumbers = new RegExp("^[0-9 ]*$");

// Inquirer prompts array, validate name returns a non empty string of regex letters, and ID returns a non empty regex integer
const questions = [
    {
        type: "input",
        message: "What is the employee's NAME?",
        name: "EmployeeName",
        validate: function checkString(name) {
            if (name == "") {
                return "Input required";
            } else if (regexStrings.test(name)) {
                return true;
            } else {
                return "Expected Input type: letters";
            }
        },
    },
    {
        type: "input",
        message: "What is the employee's ID?",
        name: "EmployeeID",
        validate: function checkNumbers(name) {
            if (name == "") {
                return "Input required";
            } else if (regexNumbers.test(name)) {
                return true;
            } else {
                return "Expected Input type: numbers";
            }
        },
    },
    {
        type: "input",
        message: "What is the employee's E-MAIL?",
        name: "EmployeeEmail"
    },
    {
        type: "list",
        message: "What is the employee's ROLE?",
        choices: ["Manager", "Engineer", "Intern"],
        name: "EmployeeRole"
    },
    {
        type: "input",
        message: "What is their office number?",
        name: "ManagerOffice",
        when: (answers => answers.EmployeeRole === "Manager")
    },
    {
        type: "input",
        message: "What is their github username?",
        name: "EngineerGithub",
        when: (answers => answers.EmployeeRole === "Engineer")
    },
    {
        type: "input",
        message: "What school are they attending?",
        name: "InternSchool",
        when: (answers => answers.EmployeeRole === "Intern")
    },
    {
        type: "confirm",
        message: "Would you like to add another employee?",
        name: "RepeatInquirer",
        default: true,
    },
]

// Prompt Inquirer on app.js init
inquirer
    .prompt(questions)
    .then(response => {
        handleInquirerPrompts(response);
    });

function handleInquirerPrompts(response) {
    // Variables to pass into new Employee instances
    const newName = response.EmployeeName;
    const newID = response.EmployeeID;
    const newEmail = response.EmployeeEmail;

    // Create new Employee subclasses depending on role
    let newEmployee = "";
    if (response.EmployeeRole === "Manager") {
        newEmployee = new Manager(newName, newID, newEmail, response.ManagerOffice);
    } else if (response.EmployeeRole === "Engineer") {
        newEmployee = new Engineer(newName, newID, newEmail, response.EngineerGithub);
    } else if (response.EmployeeRole === "Intern") {
        newEmployee = new Intern(newName, newID, newEmail, response.InternSchool);
    }

    // Push new employee instance to array
    employeeArray.push(newEmployee);

    // Continue prompting inquirer if user selects Yes to confirm question
    if (response.RepeatInquirer === true) {
        inquirer
            .prompt(questions)
            .then(response => {
                handleInquirerPrompts(response);
            });
    } else {
        // Else render the employee array and write it to team.html
        fs.writeFile(outputPath, render(employeeArray), function (err) {
            err ? console.log(err) : console.log("team.html successfully created!");
        });
    }
}