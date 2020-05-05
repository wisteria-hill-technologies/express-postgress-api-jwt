#  Express PostgreSQL API with JWT Authentication
This is a basic api made with an express/nodejs server with postgreSQL database as well as JWT authentication.

### What does this API do?
- sign up user
- log in user
- CRUD categories and their relations with other categories as parent categories
- CRUD items and their relations with categories

### How to set up
- requires nodejs and postgreSQL setup already on your machine
- clone this repo
- npm install
- create .env file and add your database credentials. See the example file(.env.example).
- Create a postgreSQL Database and Tables with the SQL commands in database.sql
- add your database credentials in .env

### How to spin
- Server
  ```npm run start```

### Endpoints
Please refer the api documentation below:
https://documenter.getpostman.com/view/971875/Szmb7fCF

1. First hit the signup endpoint to create a new user and get jwt token.
2. Next time you can use login endpoint to get jwt auth token.
3. Use the token to access all the other endpoints.  JWT expiry is currently set to 30 mins. So, after 30 mins, you will need to get a new token again from the login endpoint to access the authenticated endpoints.

### Additional
I am going to make a version with session token instead of jwt for authentication.  It will be easy to swap from JWT to session.
