var inquirer = require('inquirer');
var mysql = require('mysql');
var consoleTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "hockey930",
    database: "bamazon"
});

connection.connect(function (error) {
    if (error) throw error;

    console.log("\n-----------------------------------------------------------------"
        + "\nWelcome to Bamazon! Check out what we've got for you!\n"
        + "-----------------------------------------------------------------\n");

    startApp();

});

function startApp() {
    inquirer.prompt([
        {
            name: "action",
            type: "list",
            choices: ["View items for sale", "Leave the store"],
            message: "Please select what you would like to do!"

        }

    ]).then(function(action){
        if (action.action === "View items for sale") {
            viewItems();
        } else if (action.action === "Leave the store") {
            stopApp();
        }
    })
};