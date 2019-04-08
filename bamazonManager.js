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
                    addItemName();
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
                console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: $" + element.price + "|| Quantity: " + element.stock_quantity);
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
                console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: $" + element.price + "|| Quantity: " + element.stock_quantity);
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
                        console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: $" + element.price + " || Quantity: " + element.stock_quantity);
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

function addItemName(){
    inquirer
        .prompt([
            {
                name: "itemName",
                message: "Name of item you'd like to add: ",
                type: "input",
            }
        ])
        .then(answers => {
            addItemDepartment(answers.itemName);
        });
}

function addItemDepartment(name){
    inquirer
        .prompt([
            {
                name: "itemDepartment",
                message: "Department of item: ",
                type: "input",
            }
        ])
        .then(answers => {
            addItemPrice(name,answers.itemDepartment);
        });
}

function addItemPrice(name,department){
    inquirer
        .prompt([
            {
                name: "itemPrice",
                message: "Price of item: ",
                type: "input",
                validate: function validateInput(itemPrice){
                    if(!parseFloat(itemPrice)) return false;
                    if(parseFloat(itemPrice) < 0.0) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            var fixedPrice = toFixedTrunc(parseFloat(answers.itemPrice),2);
            addItemQuantity(name,department,fixedPrice);
        });
}

function addItemQuantity(name,department,price){
    inquirer
        .prompt([
            {
                name: "quantity",
                message: "Quantity of item: ",
                type: "input",
                validate: function validateInput(quantity){
                    if(!parseInt(quantity)) return false;
                    if(parseInt(quantity)<0) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            addItemToDb(name,department,price,answers.quantity);
        });
}

function addItemToDb(name,department,price,quantity){
    var buildItem = "Item: " + name + " || Department: " + department + " || Price: " + price + " || Quantity: " + quantity;
    inquirer
        .prompt([
            {
                name: "option",
                message: "Correct?: " + buildItem,
                type: "list",
                choices: ['Yes', 'No']
            }
        ])
        .then(answers => {
            if(answers.option === 'Yes'){
                connection.query({
                    sql: 'INSERT INTO products(product_name,department_name,price,stock_quantity) VALUES (?,?,?,?)',
                    values: [name,department,parseFloat(price),parseInt(quantity)]
                },
                    function (error, results) {
                        if (error) throw error;
                        console.log("Number of records inserted: " + results.affectedRows);
                        openingFunctions();
                    });
            }
            else return;
        });
}

// Borrowed from Stackoverflow, lots of answers but this one seemed most accurate
// https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding/11818658
function toFixedTrunc(value, n) {
    const v = value.toString().split('.');
    if (n <= 0) return v[0];
    let f = v[1] || '';
    if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
    while (f.length < n) f += '0';
    return `${v[0]}.${f}`
}

init();