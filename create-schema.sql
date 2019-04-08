CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
	item_id int NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(100) NULL,
	department_name VARCHAR(100) NULL,
	price DECIMAL(10,2) NULL,
	stock_quantity INTEGER(10) NULL,
	PRIMARY KEY(item_id)
);

ALTER TABLE products
ADD product_sales DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE departments(
	department_id int NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(100) NULL,
	over_head_costs DECIMAL(10,2) NULL,
	PRIMARY KEY(department_id)
);