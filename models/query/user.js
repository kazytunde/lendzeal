const mysqlconnection = require("../../startup/db").mysqlconnection;
const mysql = require("mysql");
const { isEmpty } = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
const winston = require("winston");
const { populateUser, populateUserDetail } = require("../user");

const SINGLE_ROW = 1;
const DEFAULT_ROLE = "member";

const getAllUsers = () => {
  return query(`SELECT * FROM users`);
};

const getUserByEmail = async email => {
  let sql = `SELECT * FROM users where email = ?`;
  return getSingleUser(sql, email);
};

const getUserById = async userid => {
  let sql = `SELECT * FROM users where userid = ?`;
  const user = await getSingleUser(sql, userid);

  return populateUserDetail(user);
};

const getSingleUser = async (sql, value) => {
  const inserts = [value];
  sql = mysql.format(sql, inserts);

  const user = await query(sql, SINGLE_ROW);
  if (isEmpty(user)) {
    return undefined;
  }
  const role = await getUserRole(user.userid);
  return populateUser(user, role);
};

const getUserDetailsByEmail = async email => {
  let sql = `SELECT * from users WHERE email = ? `;
  const inserts = [email];
  sql = mysql.format(sql, inserts);

  const user = await query(sql, SINGLE_ROW);
  if (isEmpty(user)) {
    return undefined;
  }

  const address = await getUserAddress(user.addressid);
  const role = await getUserRole(user.userid);
  const rank = await getUserRank(user.rankid);

  return populateUserDetail(user, address, rank, role);
};

const getUserAddress = addressId => {
  let sql = `SELECT * FROM address where addressid = ?`;
  const inserts = [addressId];
  sql = mysql.format(sql, inserts);

  return query(sql, SINGLE_ROW);
};

const getUserRank = rankId => {
  let sql = `SELECT * FROM ranking where rankid = ?`;
  const inserts = [rankId];
  sql = mysql.format(sql, inserts);

  return query(sql, SINGLE_ROW);
};

const registerUser = async ({
  firstname,
  lastname,
  phone,
  email,
  password
}) => {
  let sql = `INSERT INTO users ( firstname, lastname, phone, email, password ) VALUES (?,?,?,?,?)`;
  const inserts = [firstname, lastname, phone, email, password];
  sql = mysql.format(sql, inserts);

  await query(sql);
  return "Role saved successfully";
};

const updateUserAddress = async (userid, addressid) => {
  let sql = `UPDATE users set addressid = ? where userid = ?`;
  const inserts = [addressid, userid];
  sql = mysql.format(sql, inserts);

  await query(sql);
};

const addAddress = async ({ street, city, state, postercode, country }) => {
  let sql = `INSERT INTO address ( street, city, state, postercode, country ) VALUES (?,?,?,?,?)`;
  const inserts = [street, city, state, postercode, country];
  sql = mysql.format(sql, inserts);

  const response = await query(sql);

  return response.insertId;
};

const generateAuthToken = async user => {
  console.log("user", user);
  const response = await getUserRole(user.userid);

  const roles = response.filter(({ role }) => role === "admin");
  const token = jwt.sign(
    {
      userid: user.userid,
      email: user.email,
      isAdmin: !isEmpty(roles),
      addressId: user.addressid
    },
    config.get("jwtPrivateKey")
  );

  return token;
};

const getAllRoles = async () => {
  const roles = await query(`SELECT * FROM roles`);
  return roles;
};

const createNewlRole = async role => {
  let sql = `INSERT INTO roles ( role ) VALUES (?)`;
  const inserts = [role];
  sql = mysql.format(sql, inserts);

  await query(sql);
  return "Role saved successfully";
};

const getRoleId = async roleName => {
  const roles = await getAllRoles();
  console.log(roles);
  const role = roles.filter(({ role }) => role === roleName);
  return role[0].roleid;
};

const setUserRole = async userId => {
  const roleId = await getRoleId(DEFAULT_ROLE);
  console.log("roleId", roleId);

  let sql = `INSERT INTO userrole ( roleid, userid ) VALUES (?,?)`;
  const inserts = [roleId, userId];
  sql = mysql.format(sql, inserts);

  await query(sql);
  return "User role saved successfully";
};

const getUserRole = userId => {
  let sql = `SELECT 
  role
  FROM userrole u 
  JOIN roles ro on u.roleid = ro.roleid
  WHERE userid = ?`;
  const inserts = [userId];
  sql = mysql.format(sql, inserts);

  return query(sql);
};

const addUserRole = async (roleid, userId) => {
  let sql = `INSERT INTO userrole ( roleid, userid ) VALUES (?,?)`;
  const inserts = [roleid, userId];
  sql = mysql.format(sql, inserts);

  await query(sql);
  return "Role saved successfully";
};

const removeUserRole = async (roleid, userId) => {
  let sql = `DELETE FROM userrole where roleid = ? and userid = ?`;
  const inserts = [roleid, userId];
  sql = mysql.format(sql, inserts);

  await query(sql);
  return "Role removed successfully";
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
  getAllUsers,
  getUserByEmail,
  generateAuthToken,
  registerUser,
  mysqlconnection,
  addUserRole,
  removeUserRole,
  createNewlRole,
  getUserDetailsByEmail,
  getUserById,
  addAddress,
  updateUserAddress
};
