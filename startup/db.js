const winston = require("winston");
const config = require("config");
const mysql = require("mysql");

const mysqlconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "babatunde2",
  database: "etoile"
});

module.exports = {
  mysqlconnection
};
