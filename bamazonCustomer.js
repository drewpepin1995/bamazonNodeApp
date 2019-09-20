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

    ]).then(function (action) {
        if (action.action === "View items for sale") {
            viewItems();
        } else if (action.action === "Leave the store") {
            stopApp();
        }
    })
};

function viewItems() {
    var query = "SELECT * FROM products";

    connection.query(query, function (error, results) {

        if (error) throw error;

        var values = [];

        for (var i = 0; i < results.length; i++) {

            var resultObject = {
                ID: results[i].item_id,
                Item: results[i].product_name,
                Department: results[1].department_name,
                Price: "$" + results[i].price,
                Stock: results[i].stock_quantity
            };

            values.push(resultObject);
        }

        console.table("\nItems for Sale", values);

        inquirer.prompt([
            {
                name: "id",
                message: "Please enter the ID of the item that you would like to purchase.",

                validate: function (value) {
                    if (value > 0 && isNaN(value) === false && value <= results.length) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "qty",
                message: "What quantity would you like to purchase?",

                validate: function (value) {
                    if (value > 0 && isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (transaction) {

            var itemQty;
            var itemPrice;
            var itemName;
            var productSales;

            for (var i = 0; i < results.length; i++) {
                if (parseInt(transaction.id) === results[i].item_id) {
                    itemQty = results[i].stock_quantity;
                    itemPrice = results[i].price;
                    itemName = results[i].product_name;
                    productSales = results[i].product_sales;
                    totalPrice = itemPrice * transaction.qty;
                }
            }

            if (parseInt(transaction.qty) > itemQty) {
                console.log("\nInsufficient inventory for your requested quantity. We have "
                    + itemQty + " in stock. Try again.\n");
                startApp();
            }

            else if (parseInt(transaction.qty) <= itemQty) {
                console.log("\nCongrats! You successfully purchased " + transaction.qty
                    + " of " + itemName + "(s) for " + totalPrice + ".");
                lowerQty(transaction.id, transaction.qty, itemQty, itemPrice);
                startApp();

            }
        });
    });
};


function lowerQty(item, purchaseQty, stockQty, price) {

    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: stockQty - parseInt(purchaseQty)
            },
            {
                item_id: parseInt(item)
            }
        ],

        function (error, response) {
            if (error) throw error;
        });
}

function stopApp() {
    console.log("\nThanks for stopping by! Have a good day.");
    connection.end();
};
