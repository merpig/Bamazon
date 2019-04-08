var mysql = require('mysql');
var inquirer = require('inquirer');
var cTable = require('console.table');
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
                choices: ['View Product Sales by Department', 'Create New Department','Exit']
            }
        ])
        .then(answers => {
            switch(answers.option){
                case 'View Product Sales by Department':
                    productSaleByDep();
                    break;
                case 'Create New Department':
                    addDepName();
                    break;
                case 'Exit':
                    connection.end();
                    break;
                default:

            }
        });
}

function productSaleByDep(){
    var tableArray = [];
    connection.query({
        sql: 'SELECT departments.department_id AS depId,' +
        'products.department_name AS prodDep,'+
        'departments.over_head_costs AS depCosts,'+
        'products.product_sales AS prodSales '+
        'FROM departments '+
        'JOIN products ON departments.department_name = products.department_name '+
        'GROUP BY departments.department_id,'+
        'products.department_name,'+
        'departments.over_head_costs,'+
        'products.product_sales'
    },
        function (error, results) {
            if (error) throw error;
            results.forEach(element => {
                tableArray.push(
                    {
                        department_id: element.depId,
                        department_name: element.prodDep,
                        over_head_costs: toFixedTrunc(element.depCosts,2),
                        product_sales: toFixedTrunc(element.prodSales,2),
                        total_profit: toFixedTrunc(parseFloat(element.prodSales)-parseFloat(element.depCosts),2)
                    }
                );
            });
            console.table(tableArray);
            openingFunctions();
        });
}

function addDepName(){
    inquirer
        .prompt([
            {
                name: "depName",
                message: "What department would you like to add?: ",
                type: "input",
            }
        ])
        .then(answers => {
            addDepOverhead(answers.depName);
        });
}

function addDepOverhead(depName){
    inquirer
        .prompt([
            {
                name: "depOverhead",
                message: "Overhead for department: ",
                type: "input",
                validate: function validateInput(depOverhead){
                    if(!parseFloat(depOverhead)) return false;
                    if(parseFloat(depOverhead) < 0.0) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            var fixedOverhead = toFixedTrunc(parseFloat(answers.depOverhead),2);
            addItemToDb(depName,fixedOverhead);
        }); 
}

function addItemToDb(depName,depOverhead){
    var buildItem = "Department: " + depName + " || Overhead: " + depOverhead;
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
                    sql: 'INSERT INTO departments(department_name,over_head_costs) VALUES (?,?)',
                    values: [depName,parseFloat(depOverhead)]
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

function toFixedTrunc(value, n) {
    const v = value.toString().split('.');
    if (n <= 0) return v[0];
    let f = v[1] || '';
    if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
    while (f.length < n) f += '0';
    return `${v[0]}.${f}`
}

init();