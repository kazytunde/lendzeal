const Joi = require("joi");
const { pick } = require("lodash");

const populateAgreementDetail = (
  {
    agreementid,
    borrowedamount,
    repaidamount,
    repaymentdate,
    createddate,
    updateddate
  },
  { lender, borrower, laywer, witness1, witness2 }
) => {
  return {
    agreementid,
    borrowedamount,
    repaidamount,
    repaymentdate,
    createddate,
    updateddate,
    lender: formatUser(lender),
    borrower: formatUser(borrower),
    laywer: formatUser(laywer),
    witness1: formatUser(witness1),
    witness2: formatUser(witness2)
  };
};

const populateTempAgreementDetail = agreement => {
  return {
    agreementid: agreement.agreementid,
    borrowedamount: agreement.borrowedamount,
    repaidamount: agreement.repaidamount,
    repaymentdate: agreement.repaymentdate,
    createddate: agreement.createddate,
    updateddate: agreement.updateddate,
    lender: { email: agreement.lender, signed: agreement.lendersigned },
    borrower: { email: agreement.borrower, signed: agreement.borrowersigned },
    lawyer: { email: agreement.lawyer, signed: agreement.lawyersigned },
    witness1: { email: agreement.witness1, signed: agreement.witness1signed },
    witness2: { email: agreement.witness2, signed: agreement.witness2signed }
  };
};

function formatUser(user) {
  return pick(user, ["firstname", "lastname", "phone", "email"]);
}

function validateAgreementUpdate(user) {
  const schema = {
    lender: Joi.string()
      .min(5)
      .max(50)
      .email(),
    borrower: Joi.string()
      .min(5)
      .max(50)
      .email(),
    witness1: Joi.string()
      .min(5)
      .max(50)
      .email(),
    witness2: Joi.string()
      .min(5)
      .max(50)
      .email(),
    lawyer: Joi.string()
      .min(5)
      .max(50)
      .email(),
    borrowedamount: Joi.number().min(0),
    repaymentdate: Joi.date()
      .timestamp()
      .format("YYYY-MM-DD")
      .greater(new Date())
  };

  return Joi.validate(user, schema);
}

function validateAgreement(agreement) {
  const schema = {
    lender: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    borrower: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    witness1: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    witness2: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    lawyer: Joi.string()
      .min(5)
      .max(50)
      .email(),
    borrowedamount: Joi.number()
      .min(0)
      .required(),
    repaymentdate: Joi.date()
      .required()
      .greater(new Date())
  };

  return Joi.validate(agreement, schema);
}

module.exports = {
  populateAgreementDetail,
  validateAgreement,
  validateAgreementUpdate,
  populateTempAgreementDetail
};
