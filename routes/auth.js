const Joi = require("joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const {
  getUserDetailsByEmail,
  generateAuthToken
} = require("../models/query/user");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let retrievedUser = await getUserDetailsByEmail(req.body.email);
  if (retrievedUser === undefined) return res.status(400).send("Invalid email");

  const { user, password } = retrievedUser;

  const validPassword = await bcrypt.compare(req.body.password, password);
  if (!validPassword) return res.status(400).send("Invalid password.");

  const token = await generateAuthToken(user);
  res.send({ user, token });
});

function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(50)
      .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
