const auth = require("../middleware/auth");
const config = require("config");
const bcrypt = require("bcrypt");
const { isEmpty, pick } = require("lodash");
const { validateUser } = require("../models/user");
const express = require("express");
const router = express.Router();
const {
  getUserByEmail,
  generateAuthToken,
  registerUser,
  getUserById
} = require("../models/query/user");

router.get("/me", auth, async (req, res) => {
  const user = await getUserById(req.user.userid);
  res.send(
    pick(user, ["userid", "firstname", "lastname", "phone", "email", "role"])
  );
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const retrievedUser = await getUserByEmail(req.body.email);
  if (retrievedUser !== undefined)
    return res.status(400).send("User already registered.");

  const user = pick(req.body, [
    "firstname",
    "lastname",
    "phone",
    "email",
    "password"
  ]);

  console.log(user);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await registerUser(user);

  let savedUser = await getUserByEmail(req.body.email);

  const token = await generateAuthToken(savedUser);

  res
    .header("x-auth-token", token)
    .send(
      pick(savedUser, [
        "userid",
        "firstname",
        "lastname",
        "phone",
        "email",
        "role"
      ])
    );
});

module.exports = router;
