const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../helpers/constant")
const values = require("lodash/values");

const createJwtToken = (userid) => {
  const jwtPayload = {
    user: {
      id: userid,
    },
  };

  return jwt.sign(jwtPayload, SECRET_KEY, { expiresIn: "1h" });
};

const getErrorMessage = (errors) => {
  if (errors) {
    const [arr] = values(errors);
    const [message] = arr;
    return message;
  }
  return null;
};

module.exports = { createJwtToken, getErrorMessage };
