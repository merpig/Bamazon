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
    displayItems();
}

// Function to display items available
function displayItems(){
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity > 0'
    },
        function (error, results) {
            if (error) throw error;
            results.forEach(element => {
                console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: " + element.price + "|| Quantity: " + element.stock_quantity);
            });
            selectItem();
        });
}

function selectItem() {
    inquirer
        .prompt([
            {
                name: "id",
                message: "Please enter the id of the item you'd like to purchase: ",
                type: "input",
                validate: function validateNumber(id){
                    if(!parseInt(id)) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            selectQuantity(parseInt(answers.id));
        });
}

function selectQuantity(id){
    inquirer
        .prompt([
            {
                name: "quantity",
                message: "Please enter the quantity you'd like to purchase: ",
                type: "input",
                validate: function validateNumber(quantity){
                    if(!parseInt(quantity)) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            validateOrder(id,parseInt(answers.quantity));
        });
}

function validateOrder(id,quantity){
    //console.log("You'd like to buy item with id: " + id + " and quantity: " + quantity);
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity >= ? AND item_id=?',
        values: [quantity,id]
    },
        function (error, results) {
            if (error) throw error;
            if(!results.length){
                console.log("Insufficient Quantity");
                connection.end();
                return;
            }
            var newQuantity = results[0].stock_quantity-quantity;
            console.log("New item quantity will be: " + newQuantity);
            console.log("Your order costs a total of: $" + parseFloat(results[0].price)*quantity);
            updateDb(newQuantity,id);
        });
}

function updateDb(newQuantity,id){
    connection.query({
        sql: 'UPDATE products SET stock_quantity=? WHERE item_id=?',
        values: [newQuantity,id]
    },
        function (error, results) {
            if (error) throw error;
            connection.end();
        });
}

init();