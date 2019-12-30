const { getUserRole, getUserByEmail } = require("./user");

const getRole = async userid => {
  const roles = await getUserRole(userid);

  console.log("roles", roles);
};

const generateAuthToken = user => {
  console.log("getUserRole", getUserRole);
  console.log("getUserByEmail", getUserByEmail);
  const roles = getRole(user.userid);
  //   const token = jwt.sign(
  //     { userid: user.userid, isAdmin: user.isAdmin === 1 },
  //     config.get("jwtPrivateKey")
  //   );
  //  return token;
  return roles;
};

module.exports = {
  generateAuthToken
};
