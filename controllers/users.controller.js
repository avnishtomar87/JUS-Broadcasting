const models = require("../models");
const { users, device_token, user_subscriptions, subscriptions } = models;
const { Sequelize, Op } = require('sequelize')
const bcrypt = require("bcrypt");
const { createJwtToken, getErrorMessage } = require("../utils/token");
const axios = require("axios");
const isEmpty = require("lodash/isEmpty");
const validate = require("validate.js");
const { OAuth2Client } = require("google-auth-library");
const catchAsync = require("../utils/catchAsync");
const createHttpError = require("http-errors");
const { successData } = require("../helpers/response");
const { randomNumber, randomPassword, getPlanExpiry, getAddress } = require("../helpers/service")
const { CLIENT_ID,
  FB_URL,
  EMAIL_VERIFY_LINK,
  CUSTOM_LOGIN_TYPE,
  FB_LOGIN_TYPE,
  GOOGLE_LOGIN_TYPE,
  TRIAL_DURATION,
  TRIAL_PLAN,
  UNPAID_PAYMENT_STATUS } = require("../helpers/constant")
const { emailPassword, sendEmail } = require("../helpers/sendEmail");


// To register new user
const signUp = catchAsync(async (req, res, next) => {
  const { body } = req;
  const {
    first_name,
    last_name,
    mobile_number,
    email,
    password,
    dob,
    lat,
    long
  } = body;
  const errors = validate(body, {
    email: { email: true, presence: true },
    password: { presence: true },
    first_name: { presence: true },
  });

  const message = getErrorMessage(errors);
  if (!isEmpty(message)) {
    res.send({ message });
    return;
  }
  const salt = await bcrypt.genSalt(10);

  var newDate = dob.split('-').reverse().join('');
  const user_name = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${newDate}`

  const geo_location = Sequelize.fn("ST_MakePoint", lat, long)
  const current_address = await getAddress(lat, long)
  const country = current_address.split(",").pop().trim()

  const payload = {
    first_name,
    last_name,
    user_name,
    dob,
    mobile_number,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, salt),
    login_type: CUSTOM_LOGIN_TYPE,
    geo_location,
    current_address,
    country,
  };
  const user = await users.create(payload);
  const data = await users.findOne({
    where: { email: payload.email.toLowerCase() },
    attributes: { exclude: ["password"] }
  });
  const token = createJwtToken(user.id);
  if (isEmpty(data)) {
    throw createHttpError(`something went wrong`);
  }
  const days = JSON.parse(TRIAL_PLAN)
  const expires_at = getPlanExpiry(days)
  const subscription = await subscriptions.findOne({ where: { duration: TRIAL_DURATION } })
  await user_subscriptions.create({
    user_id: user.id,
    subscription_id: subscription.id,
    expires_at,
    payment_status: UNPAID_PAYMENT_STATUS
  })
  link = `${EMAIL_VERIFY_LINK}=${user.email}`
  await sendEmail({
    to: user.email,
    subject: "Account Verification",
    link
  });
  res.json({ message: "Registration Successfull , please Check Your Mail For Acoount Verification", token, data });
});


// for user login
const logIn = catchAsync(async (req, res) => {
  const { body } = req;
  const { email, mobile_number, password } = body;
  const errors = validate(body, {
    password: { presence: true },
  });
  const message = getErrorMessage(errors);
  if (!isEmpty(message)) {
    res.send({ message });
    return;
  }
  const payload = { email, mobile_number, password };
  const user = await users.findOne({
    where: {
      [Op.or]: [
        { email: { [Op.eq]: email } },
        { mobile_number: { [Op.eq]: mobile_number } }
      ],
      login_type: CUSTOM_LOGIN_TYPE,
    }
  });
  if (isEmpty(user))
    return res.json(successData("User does not exist. Please Enter valid email !!"));
  if (!isEmpty(user)) {
    const password_valid = await bcrypt.compare(
      payload.password,
      user.password
    );
    if (password_valid) {
      const data = await users.findOne({
        where: {
          [Op.or]: [
            { email: { [Op.eq]: email } },
            { mobile_number: { [Op.eq]: mobile_number } }
          ]
        },
        attributes: { exclude: ["password"] }
      })
      if (data.is_active) {
        const token = createJwtToken(user.id);
        res.json({ message: "login successfully", token, data });
      } else {
        res.json(successData("Please activate your account before login!! please check your mail for activation link"));
      }
    } else {
      res.json(successData("Password Incorrect"));
    }
  } else {
    res.json(successData("User does not exist"));
  }
});

//for admin login 
const adminLogin = async (req, res, next) => {
  const { body } = req;
  const { email, password } = body;
  const errors = validate(body, {
    email: { email: true, presence: true },
    password: { presence: true },
  });

  const message = getErrorMessage(errors);
  if (!isEmpty(message)) {
    res.status(400).send({ message });
    return;
  }
  const payload = { email, password };
  const user = await users.findOne({
    where: {
      email: payload.email.toLowerCase(),
      user_type: "admin"
    },
  });
  if (isEmpty(user))
    return res.json(successData("User does not exist. Please Enter valid email !!"));
  if (!isEmpty(user)) {
    const password_valid = await bcrypt.compare(
      payload.password,
      user.password
    );
    if (password_valid) {
      const data = await users.findOne({
        where: {
          email: payload.email.toLowerCase(),
          user_type: "admin"
        },
        attributes: { exclude: ["password"] }
      })
      const token = createJwtToken(user.id);
      res.json({ message: "login successfully", token, data });
    } else {
      res.json(successData("Password Incorrect"));
    }
  } else {
    res.json(successData("User does not exist"));
  }
}

// update users data
const updateUser = (req, res, next) => {
  const { body: {
    first_name,
    last_name,
    dob, },
    params: { id }
  } = req;
  users.update(
    {
      first_name,
      last_name,
      dob,
    },
    { where: { id } }
  ).then((data) => {
    if (data[0] == 0) {
      throw createHttpError(`users ${id} not found`);
    }
    res.json(successData("updated successfully", data));
  }).catch(next);
};

const updateAdmin = (req, res, next) => {
  const { body: {
    first_name,
    last_name,
    dob,
    email,
    mobile_number },
    params: { id }
  } = req;
  users.update(
    {
      first_name,
      last_name,
      dob,
      email,
      mobile_number
    },
    { where: { id } }
  ).then((data) => {
    if (data[0] == 0) {
      throw createHttpError(`users ${id} not found`);
    }
    res.json(successData("updated successfully", data));
  }).catch(next);
};


// get all users data
const getAllUsers = (req, res, next) => {
  users.findAll({ attributes: { exclude: ["password"] } })
    .then((data) => {
      if (isEmpty(data)) {
        throw createHttpError(`No users data found in the database`);
      }
      res.json(successData("success", data));
    })
    .catch(next);
};

//get specific user data by id
const getUserById = (req, res, next) => {
  const { params: { id } } = req;
  const include = [
    {
      model: user_subscriptions,
      attributes: ["id", "payment_status", "expires_at", "is_expired"], required: false,
      include: [{
        model: subscriptions, attributes: { exclude: ["payment_key", "createdAt", "updatedAt", "deletedAt"] }, required: false
      }]
    }
  ];
  users.findOne({
    where: { id },
    attributes: { exclude: ["password", "updatedAt", "deletedAt"] },
    include
  })
    .then((data) => {
      if (isEmpty(data)) {
        throw createHttpError(`user ${id} not found`);
      }
      res.json(successData("success", data));
    })
    .catch(next);
};

// delete a user
const deleteUserById = (req, res, next) => {
  const { params: { id } } = req;
  users.destroy({ where: { id } })
    .then((data) => {
      if (!data) {
        throw createHttpError(`users ${id} not found`);
      }
      res.json(successData("deleted successfully", data));
    })
    .catch(next);
};

// change users password
const resetPassword = catchAsync(async (req, res) => {
  const { body: { dob, last_name, email, mobile_number } } = req;
  const salt = await bcrypt.genSalt(10);
  const user = await users.findOne({
    where: {
      dob,
      email,
    }
  });
  if (!user) {
    return res.json(successData("user not exist"));
  }
const new_password = randomPassword()
  await emailPassword({
    email: user.email,
    subject: "Password Reset",
    message: new_password
  });
  const password = await bcrypt.hash(new_password, salt)
  await users.update({ password }, { where: { email } })
  res.json(successData("password reset successfully!! please check your mail for new password"));
});

// Google Signup
const googleSignUp = catchAsync(async (req, res, next) => {
  const { body: { idToken, lat, long } } = req;
  const client = new OAuth2Client(CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const { email, ...rest } = ticket.getPayload();
  const user = await users.findOne({
    where: { email, login_type: GOOGLE_LOGIN_TYPE },
    attributes: { exclude: ["password"] }
  });
  if (!isEmpty(user)) {
    return res.json(successData("User already Exists Please Signup With Another Way!!"));
  } else {

    const geo_location = Sequelize.fn("ST_MakePoint", lat, long)
    const current_address = await getAddress(lat, long)
    const country = current_address.split(",").pop().trim()
    const user_name = `${rest.given_name.toLowerCase()}.${rest.family_name.toLowerCase()}${randomNumber}`

    const payload = {
      email,
      first_name: rest.given_name,
      last_name: rest.family_name,
      user_name,
      login_type: GOOGLE_LOGIN_TYPE,
      geo_location,
      current_address,
      country,
      is_active: true
    };
    const days = JSON.parse(TRIAL_PLAN)
    const expires_at = getPlanExpiry(days)

    const user = await users.create(payload);
    const subscription = await subscriptions.findOne({ where: { duration: TRIAL_DURATION } })
    await user_subscriptions.create({
      user_id: user.id,
      subscription_id: subscription.id,
      expires_at,
      payment_status: UNPAID_PAYMENT_STATUS
    })
    const data = await users.findOne({
      where: { email, login_type: GOOGLE_LOGIN_TYPE },
      attributes: { exclude: ["password"] }
    });
    const token = createJwtToken(data.id);
    res.json({ data, token: token });
  }
});

//google login
const googleLogin = catchAsync(async (req, res, next) => {
  const { body: { idToken } } = req;
  const client = new OAuth2Client(CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const { email } = ticket.getPayload();
  const data = await users.findOne({
    where: { email, login_type: GOOGLE_LOGIN_TYPE },
    attributes: { exclude: ["password"] }
  });
  if (isEmpty(data))
    return res.json(successData("User does not exist. Please create an account."));
  if (!isEmpty(data)) {
    const token = createJwtToken(data.id);
    res.json({ message: "Login Successfully", data, token });
  }
});

// Facebook Signup
const fbSignUp = catchAsync(async (req, res) => {
  const { body: { accessToken, lat, long } } = req;

  const { data } = await axios(`${FB_URL}=${accessToken}`);
  const { email, name } = data;
  if (!email)
    return res.json(successData("Email is not associated to facebook. Please try to signup another way"));

  const user = await users.findOne({
    where: { email, login_type: FB_LOGIN_TYPE },
    attributes: { exclude: ["password"] }
  });
  if (!isEmpty(user)) {
    return res.json(successData("User already Exists Please Signup With Another Way!!"));
  } else {
    const first_name = name.split(" ")[0]
    const last_name = name.split(" ")[1]
    const geo_location = Sequelize.fn("ST_MakePoint", lat, long)
    const current_address = await getAddress(lat, long)
    const country = current_address.split(",").pop().trim()
    const user_name = `${first_name.toLowerCase()}.${last_name.toLowerCase()}${randomNumber}`

    const payload = {
      email,
      first_name,
      last_name,
      user_name,
      login_type: FB_LOGIN_TYPE,
      geo_location,
      current_address,
      country,
      is_active: true
    };
    const days = JSON.parse(TRIAL_PLAN)
    const expires_at = getPlanExpiry(days)

    const user = await users.create(payload);
    const subscription = await subscriptions.findOne({ where: { duration: TRIAL_DURATION } })
    await user_subscriptions.create({
      user_id: user.id,
      subscription_id: subscription.id,
      expires_at,
      payment_status: UNPAID_PAYMENT_STATUS
    })

    const newUser = await users.findOne({
      where: { email, login_type: FB_LOGIN_TYPE },
      attributes: { exclude: ["password"] }
    });
    const token = createJwtToken(newUser.id);
    res.json({ newUser, token: token });
  }
});

//fb login 
const fbLogin = catchAsync(async (req, res) => {
  const { body: { accessToken } } = req;

  const { data } = await axios(`${FB_URL}=${accessToken}`);
  const { email } = data;
  if (!email)
    return res.json(successData("Email is not associated to facebook. Please try to signup another way"));

  const user = await users.findOne({
    where: { email, login_type: FB_LOGIN_TYPE },
    attributes: { exclude: ["password"] }
  });
  if (isEmpty(user))
    return res.json(successData("User does not exist. Please create an account."));
  if (!isEmpty(user)) {
    const token = createJwtToken(user.id);
    res.json({ message: "Login Successfully", user, token });
  }
});

//Apple login
const appleLogin = catchAsync(async (req, res) => {
  const { body: { email, fullName, identityToken, ...rest } } = req;
  const user = await users.findOne({
    where: { apple_token: identityToken },
    raw: true,
  });
  if (!isEmpty(user)) {
    const token = createJwtToken(user.id);
    res.json({ ...user, token: token });
  } else {
    rest.fullName = fullName;
    const payload = {
      email,
      first_name: rest.fullName,
      apple_token: identityToken,
    };
    await users.create(payload);
    const data = await users.findOne({
      where: { apple_token: identityToken },
      raw: true,
    });
    const token = createJwtToken(data.id);
    res.json({ ...data, token: token });
  }
});

const emailVerify = catchAsync(async (req, res, next) => {
  const { query: { email } } = req;
  const user = await users.findOne({ where: { email } })
  if (!user) {
    res.json(successData(`We were unable to find a user for email ${email} for verification. Please SignUp!`));
  } else if (user.is_active) {
    res.json(successData("This acoount has already been verified. Please Login"));
  } else {
    user.is_active = true;
    user.save()
    res.render('emailActivate');
  }
})

const deviceToken = catchAsync(async (req, res) => {
  const { body: { user_id, device_token, device_type } } = req;
  const entry = await device_token.findOne({
    where: {
      [Sequelize.Op.or]: [
        {
          device_token: {
            [Sequelize.Op.eq]: device_token,
          },
        },
        {
          user_id: {
            [Sequelize.Op.eq]: user_id,
          },
        },
      ],
    },
  });
  if (isEmpty(entry)) {
    await device_token.create({
      device_token,
      user_id,
      device_type,
    });
  } else {
    if (entry.device_token !== device_token && entry.user_id === user_id) {
      if (entry.device_type !== device_type) {
        await device_token.create({
          user_id,
          device_token,
          device_type,
        });
      } else {
        await entry.destroy();
        await device_token.create({
          user_id,
          device_token,
          device_type,
        });
      }
    }
    if (entry.user_id !== user_id && entry.device_token === device_token) {
      await entry.update({
        user_id,
        device_token,
        device_type,
      });
    }
  }
  res.json(successData("Data added successfully"));
});

const profile = (req, res, next) => {
  const { params: { id } } = req;
  const include = [
    {
      model: user_subscriptions, attributes: { exclude: ["updatedAt", "deletedAt"] },
      include: [
        { model: subscriptions, attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] }, },
      ]
    }]
  attributes = { exclude: ["user_type", "password", "updatedAt", "deletedAt"] },

    users.findOne({
      where: { id },
      attributes,
      include
    }).then((data) => {
      if (isEmpty(data)) {
        throw createHttpError(`user ${id} not found`);
      }
      res.json(successData("success", data));
    }).catch(next);
}

const updateLocation = catchAsync(async (req, res) => {
  const { body: { lat, long }, params: { id } } = req;

  const geo_location = Sequelize.fn("ST_MakePoint", lat, long)
  const current_address = await getAddress(lat, long)
  const country = current_address.split(",").pop()
  const data = await users.update(
    {
      geo_location,
      current_address,
      country,
    },
    { where: { id } }
  )
  res.json(successData("updated successfully", data));
})

const isActiveAccount = catchAsync(async (req, res) => {
  const { params: { id } } = req;
  const user = await users.findOne({ where: { id } })
  if (!user) {
    res.json(successData(`We were unable to find a user ${id}`));
  } else if (user.is_active) {
    res.json(user.is_active);
  } else {
    res.json(user.is_active);
  }
})


module.exports = {
  signUp,
  logIn,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  resetPassword,
  googleSignUp,
  googleLogin,
  fbSignUp,
  fbLogin,
  appleLogin,
  emailVerify,
  adminLogin,
  deviceToken,
  profile,
  updateLocation,
  isActiveAccount,
  updateAdmin
};
