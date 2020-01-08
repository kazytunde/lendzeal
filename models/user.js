const Joi = require("joi");

const populateUser = (
  { userid, firstname, lastname, phone, email, password, addressid },
  role
) => {
  return {
    userid,
    firstname,
    lastname,
    phone,
    email,
    password,
    addressid,
    role: role.map(({ role }) => role)
  };
};

const populateUserDetail = (
  { userid, firstname, lastname, phone, email },
  address,
  rank,
  role
) => {
  return {
    userid,
    firstname,
    lastname,
    phone,
    email,
    ranking: rank ? rank.rankingcode : null,
    role: role.map(({ role }) => role),
    address: address ? address : {}
  };
};

function validateUser(user) {
  const schema = {
    firstname: Joi.string()
      .min(5)
      .max(50)
      .required(),
    lastname: Joi.string()
      .min(5)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    phone: Joi.string()
      .min(5)
      .max(50)
      .required(),
    password: Joi.string()
      .min(5)
      .max(50)
      .required()
  };

  return Joi.validate(user, schema);
}

function validateUserUpdate(user) {
  const schema = {
    firstname: Joi.string()
      .min(5)
      .max(50),
    lastname: Joi.string()
      .min(5)
      .max(50),
    email: Joi.string()
      .min(5)
      .max(50)
      .email(),
    password: Joi.string()
      .min(5)
      .max(50)
  };

  return Joi.validate(user, schema);
}

module.exports = {
  populateUser,
  populateUserDetail,
  validateUser,
  validateUserUpdate
};
