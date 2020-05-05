CREATE DATABASE items_database;

CREATE TABLE categories(
	cat_id serial primary key,
	label VARCHAR(100) not null,
	parent_cat_id int,
	foreign key(parent_cat_id) references categories(cat_id) ON DELETE CASCADE
);

CREATE TABLE items(
	item_id serial primary key,
	label VARCHAR(100) not null,
	cat_id int,
	foreign key(cat_id) references categories(cat_id) ON DELETE CASCADE
);

CREATE TABLE users(
	user_id serial primary key,
	email VARCHAR(30) unique not null,
	username VARCHAR(15) unique not null,
	password VARCHAR(200) not null,
	usertype INT,
	admintype INT
)
