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

const {
  updateAgreementBySigner,
  getAgreementBySigner
} = require("../models/query/agreement");

router.get("/me", auth, async (req, res) => {
  const user = await getUserById(req.user.userid);
  res.send(
    pick(user, ["userid", "firstname", "lastname", "phone", "email", "role"])
  );
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email } = req.body.email;

  const retrievedUser = await getUserByEmail(email);
  if (retrievedUser !== undefined)
    return res.status(400).send("User already registered.");

  const user = pick(req.body, [
    "firstname",
    "lastname",
    "phone",
    "email",
    "password"
  ]);

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await registerUser(user);

  let savedUser = await getUserByEmail(user.email);

  const token = await generateAuthToken(savedUser);

  //Get agreementtemp with the email, check if user needs to sign agreement
  const agreement = await getAgreementBySigner(savedUser.email);
  //check if the agreement is available

  if (agreement) {
    const partial = Object.keys(agreement).find(
      key => agreement[key] === savedUser.email
    );

    const column = partial + "signed";
    await updateAgreementBySigner(column, savedUser.email);
  }

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
