const bcrypt = require('bcrypt-nodejs');
const { body, validationResult } = require('express-validator'); //validator middleware for user inputs
const jwt = require('jwt-simple');
const pool = require("../db");

// You can send other information such as adminType and userType.
function createUserToken(user) {
  const timestamp = new Date().getTime();
  const payload = { sub: user.user_id, iat: timestamp, admintype: user.admintype, usertype: user.usertype };
  return jwt.encode(payload, process.env.JWT_SECRET);
}

exports.checkBody = [
  // username must be an email
  body('email').isEmail().normalizeEmail(),
  body('username')
    .not().isEmpty()
    .trim()
    .escape()
    .isLength({ min: 6, max: 15 }),
  body('password')
    .not().isEmpty()
    .trim()
    .escape()
    .isLength({ min: 6, max: 30 })
];

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.send({errors: errors.array()});
  }

  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const usertype = 1;
  const admintype = 0;

  let hashedPassword = null;
  await bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, null, (err, hash)=> {
      hashedPassword = hash;
    });
  });

  // Check if a user with the username already exists
  let existingUser = null;
  try {
    existingUser = await pool.query(
      "select * from users where username = $1 or email = $2",
      [username, email]
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ "error": err.message });
  }

  // If the user already exists, then return an error.
  if(existingUser.rows[0]) {
    return res.status(422).send({ error: 'This username or email is already taken. Please check and try again.' });
  }

  // If a user with username does NOT exist, create and save user record
  let newUser = null;
  try {
    newUser = await pool.query(
      "insert into users (email, username, password, usertype, admintype) values ($1, $2, $3, $4, $5) returning *",
      [email, username, hashedPassword, usertype, admintype]
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ "error": err.message });
  }
  // Use CreateUserToken function at the top of this file. Create a User JWT token and send it back as a response.
  return res.json({ token: createUserToken(newUser.rows[0]) });

};

exports.signin = async (req, res, next) => {
  const { username, password } = req.body;

  // Check if a user with the username already exists
  let user = null;
  try {
    user = await pool.query(
      "select * from users where username = $1",
      [username]
    );
  } catch (err) {
    console.error(err.message);
    res.json({ "error": err.message });
  }

  if (!user.rows[0]) {
    res.status(422).json({ error: 'Sorry we cannot find the user. Please check and try again.' });
  }

  // if user exists,
  const confirmedUser = user.rows[0];
  const retrievedPassword = confirmedUser.password;

  bcrypt.compare(password, retrievedPassword, (err, isMatch) => {
    if(err) {
      res.json({ "error": err.message });
    }
    if(!isMatch) {
      res.status(422).json({ error: 'Unable to log in. Please check and try again.' });
    } else {
      //if the passwords match, we need to give them a token.
      res.send({ token: createUserToken(confirmedUser) });
    }
  });
};

exports.JWTAuth = async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.replace("bearer ", "") : "";
  let decodedToken = '';
  try {
    decodedToken = jwt.decode(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401).json({ "error": err.message });
  }
  const currentTime = new Date().getTime();
  const minute = 1000 * 60;
  const expiryDuration = 60 * minute;
  const timeEllapsed = currentTime - decodedToken.iat;
  if (timeEllapsed > expiryDuration) {
    res.status(401).json({ "error": "Token expired" });
  }

  let user = null;
  try {
    user = await pool.query(
      "select * from users where user_id = $1",
      [decodedToken.sub]
    );
  } catch (err) {
    console.error(err.message);
    if (err) { res.status(500).json({ "error": err.message }); } // if it returns error, return done with the error and false.
  }

  //If user exists, call done with no error (null) and the user object.
  if(user.rows[0]){
    next();
  } else { // Otherwise, call done with no error and false.
    res.status(401).json({ "error": err.message });
  }
};
