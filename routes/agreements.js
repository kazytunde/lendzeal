const auth = require("../middleware/auth");
const config = require("config");
const { isEmpty, pick } = require("lodash");
const { validateAgreement } = require("../models/agreement");
const express = require("express");
const router = express.Router();
const {
  getAllAgreements,
  getAgreementById,
  getAgreementByLenderEmail,
  createAgreement,
  getTempAgreementByID,
  getAgreementBySigner,
  getCompletedAgreementsBySigner
} = require("../models/query/agreement");

const SIGNED_COLUMN_NAME = "signed";

router.get("/", auth, async (req, res) => {
  const agreements = await getAllAgreements();
  res.send(agreements);
});

router.get("/:id", auth, async (req, res) => {
  const agreement = await getAgreementById(req.params.id);
  res.send(agreement);
});

router.get("/notcompleted/:id", auth, async (req, res) => {
  const agreement = await getTempAgreementByID(req.params.id);
  res.send(agreement);
});

router.get("/signer/:email", auth, async (req, res) => {
  const agreement = await getAgreementBySigner(req.params.email);
  const completedAgreement = await getCompletedAgreementsBySigner(
    req.params.email
  );
  console.log("agreement", agreement);
  console.log("completedAgreement", completedAgreement);
  res.send([...agreement, ...completedAgreement]);
});

router.post("/", auth, async (req, res) => {
  const agreementCreatorEmail = req.user.email;
  console.log("agreementCreatorEmail", agreementCreatorEmail);
  const { error } = validateAgreement(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const retrievedAgreement = await getAgreementByLenderEmail(req.body.lender);
  if (retrievedAgreement !== undefined)
    return res.status(400).send("Agreement already initiated");

  const agreement = pick(req.body, [
    "lender",
    "borrower",
    "witness1",
    "witness2",
    "borrowedamount",
    "refundDate",
    "currencyType",
    "lawyer"
  ]);

  const partial = Object.keys(agreement).find(
    key => agreement[key] === agreementCreatorEmail
  );

  const column = partial + SIGNED_COLUMN_NAME;

  await createAgreement(agreement, column);

  //send email notifications to users

  res.send("Agreement initiated successfully");
});

module.exports = router;
