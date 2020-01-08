const mysqlconnection = require("../../startup/db").mysqlconnection;
const mysql = require("mysql");
const { isEmpty } = require("lodash");
const winston = require("winston");
const {
  populateAgreementDetail,
  populateTempAgreementDetail
} = require("../agreement");

const SINGLE_ROW = 1;

// Completed agreements table ie all partie signed
const getAllAgreements = () => {
  return query(`SELECT * FROM agreement`);
};

const getAgreementByLenderEmail = async email => {
  let sql = `SELECT agreementid 
    FROM agreement ag 
    JOIN users u on u.email = ag.lender
    WHERE lender = ?`;

  const inserts = [email];
  sql = mysql.format(sql, inserts);

  const agreement = await query(sql, SINGLE_ROW);

  if (agreement === undefined) {
    return undefined;
  }
  return agreementid;
};

const getAgreementById = async id => {
  let sql = `SELECT agreementid, 
  lender, 
  borrower, 
  lawyer, 
  witness1, 
  witness2,
  borrowedamount, 
  repaidamount,
  repaymentdate,
  createddate,
  updateddate
  FROM agreement 
  WHERE agreementid = ?`;

  const inserts = [id];
  sql = mysql.format(sql, inserts);

  const agreement = await query(sql, SINGLE_ROW);

  if (agreement === undefined) {
    return undefined;
  }

  const emails = [
    agreement.lender,
    agreement.borrower,
    agreement.witness1,
    agreement.witness2,
    agreement.lawyer ? agreement.lawyer : 0
  ];

  let sql2 = `SELECT * FROM users where email IN (?)`;
  const inserts2 = [emails];
  sql2 = mysql.format(sql2, inserts2);

  const users = await query(sql2);
  return populateAgreementDetail(agreement, formatUser(users, agreement));
};

const formatUser = (users, agreement) => {
  return {
    lender: users.find(u => u.email === agreement.lender),
    borrower: users.find(u => u.email === agreement.borrower),
    laywer: users.find(u => u.email === agreement.laywer),
    witness1: users.find(u => u.email === agreement.witness1),
    witness2: users.find(u => u.email === agreement.witness2)
  };
};

// Uncompleted agreements table ie one or more person is yet to sign

const createAgreement = async (
  {
    lender,
    borrower,
    witness1,
    witness2,
    borrowedamount,
    repaymentdate,
    lawyer
  },
  signedColumn
) => {
  let sql = `INSERT INTO agreementtemp (lender, borrower, witness1, witness2, borrowedamount, repaymentdate, lawyer, ?? ) VALUES (?,?,?,?,?,?,?,?)`;
  const inserts = [
    signedColumn,
    lender,
    borrower,
    witness1,
    witness2,
    borrowedamount,
    repaymentdate,
    lawyer,
    true
  ];

  sql = mysql.format(sql, inserts);

  await query(sql);
  return "Agreement saved successfully";
};

const updateAgreementBySigner = async (column, email) => {
  let sql = `UPDATE agreementtemp set ?? = ?, updateddate = ? where lender = ? OR borrower = ? or witness1 = ? OR witness2 = ? OR lawyer = ?`;
  const inserts = [column, true, new Date(), email, email, email, email, email];

  sql = mysql.format(sql, inserts);

  await query(sql);
  return "Agreement updated successfully";
};

const getAgreementBySigner = async email => {
  let sql = `SELECT * from agreementtemp where lender = ? OR borrower = ? or witness1 = ? OR witness2 = ? OR lawyer = ?`;
  const inserts = [email, email, email, email, email];

  sql = mysql.format(sql, inserts);
  const agreement = await query(sql, SINGLE_ROW);

  return agreement;
};

const getAllTempAgreement = async () => {
  let sql = `SELECT * from agreementtemp where lender = ? OR borrower = ? or witness1 = ? OR witness2 = ? OR lawyer = ?`;
  const inserts = [email, email, email, email, email];

  sql = mysql.format(sql, inserts);
  const agreement = await query(sql, SINGLE_ROW);

  return agreement;
};

const getTempAgreementByID = async agreementid => {
  let sql = `SELECT * from agreementtemp where agreementid = ?`;
  const inserts = [agreementid];

  sql = mysql.format(sql, inserts);
  const agreement = await query(sql, SINGLE_ROW);
  if (!agreement) {
    return `Agreement with the ID ${agreementid} not found`;
  }
  return populateTempAgreementDetail(agreement);
};

const query = (sql, row) => {
  return new Promise((resolve, reject) => {
    mysqlconnection.query(sql, (err, results, fields) => {
      if (err) {
        console.error(err.message);
        winston.error(`Error while accessing database:  ${err.message}...`);
        return reject(err.message);
      }
      const response = row === SINGLE_ROW ? results[0] : results;
      return resolve(response);
    });
  });
};

module.exports = {
  getAllAgreements,
  getAgreementById,
  createAgreement,
  getAgreementByLenderEmail,
  updateAgreementBySigner,
  getAgreementBySigner,
  getTempAgreementByID
};
