const express = require('express')
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require('../database/user');
const auth = require('../middleware/auth');

// register endpoint
router.post("/register", (req, res) => {
    const { name, email, password } = req.body
    // hash the password
    bcrypt
      .hash(req.body.password, 10)
      .then((hashedPassword) => {
     
        // save the new user
        user.create(name, email, hashedPassword)
          // return success if the new user is added to the database successfully
          .then((result) => {
            res.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          // catch erroe if the new user wasn't added successfully to the database
          .catch((error) => {
            res.status(500).send({
              message: "Error creating user",
              error,
            });
          });
      })
      // catch error if the password hash isn't successful
      .catch((e) => {
        res.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
  });
  
  // login endpoint
  router.post("/login", (req, res) => {
    const { email, password } = req.body
    // check if email exists
    user.findOne(email)
  
      // if email exists
      .then((user) => {
        // compare the password entered and the hashed password found
        bcrypt
          .compare(password, user.password)
  
          // if the passwords match
          .then((passwordCheck) => {
  
            // check if password matches
            if(!passwordCheck) {
              return res.status(400).send({
                message: "Passwords does not match",
                error,
              });
            }
  
            // create JWT token
            const token = jwt.sign(
              {
                userId: user._id,
                userEmail: user.email,
              },
              "RANDOM-TOKEN",
              { expiresIn: "24h" }
            );
  
            // return success res
            res.status(200).send({
              message: "Login Successful",
              email: user.email,
              token,
            });
          })
          // catch error if password do not match
          .catch((error) => {
            res.status(400).send({
              message: "Passwords does not match",
              error,
            });
          });
      })
      // catch error if email does not exist
      .catch((e) => {
        res.status(404).send({
          message: "Email not found",
          e,
        });
      });
  });

// free endpoint example
router.get("/free-endpoint", (req, res) => {
    res.json({ message: "You are free to access me anytime" });
});
  
// authentication endpoint example
router.get("/auth-endpoint", auth, (req, res) => {
    res.send({ message: "You are authorized to access me" });
});