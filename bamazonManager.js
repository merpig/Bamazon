var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123mumnon123',
    database: 'bamazon_db'
});

// Initial function to run the application
function init(){
    openingFunctions();
}

function openingFunctions(){
    inquirer
        .prompt([
            {
                name: "option",
                message: "Select option to continue: ",
                type: "list",
                choices: ['View Products for Sale', 'View Low Inventory','Add to Inventory','Add New Product','Exit']
            }
        ])
        .then(answers => {
            switch(answers.option){
                case 'View Products for Sale':
                    displayProducts();
                    break;
                case 'View Low Inventory':
                    displayLow();
                    break;
                case 'Add to Inventory':
                    selectItem();
                    break;
                case 'Add New Product':
                    break;
                case 'Exit':
                    connection.end();
                    break;
                default:

            }
        });
}

function displayProducts(){
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity > 0'
    },
        function (error, results) {
            if (error) throw error;
            results.forEach(element => {
                console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: " + element.price + "|| Quantity: " + element.stock_quantity);
            });
            openingFunctions();
        });
}

function displayLow(){
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity < 5'
    },
        function (error, results) {
            if (error) throw error;
            results.forEach(element => {
                console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: " + element.price + "|| Quantity: " + element.stock_quantity);
            });
            openingFunctions();
        });
}

function selectItem(){
    inquirer
        .prompt([
            {
                name: "id",
                message: "Enter the id of the item you'd like add to: ",
                type: "input",
                validate: function validateNumber(id){
                    if(!parseInt(id)) return false;
                    if(parseInt(id)<0) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            connection.query({
                sql: 'SELECT * FROM products WHERE item_id=?',
                values: [answers.id]
            },
                function (error, results) {
                    if (error) throw error;
                    results.forEach(element => {
                        console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: " + element.price + "|| Quantity: " + element.stock_quantity);
                    });
                    increaseQuantity(results[0].stock_quantity,answers.id);
                });
        });
}

function increaseQuantity(quantity,id){
    inquirer
        .prompt([
            {
                name: "newQuantity",
                message: "How much would you like to add?: ",
                type: "input",
                validate: function validateNumber(id){
                    if(!parseInt(id)) return false;
                    if(parseInt(id)<0) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            var tempNewQuantity = parseInt(quantity)+parseInt(answers.newQuantity);
            console.log("You'd like to add " + answers.newQuantity + " items making the new quantity " + (parseInt(quantity)+parseInt(answers.newQuantity) + "."));
            connection.query({
                sql: 'UPDATE products SET stock_quantity=? WHERE item_id=?',
                values: [tempNewQuantity,id]
            },
                function (error, results) {
                    if (error) throw error;
                    console.log("Item quantity updated!");
                    openingFunctions();
                });
        });
}

init();