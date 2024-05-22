const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
require('dotenv').config();

const schema = new mongoose.Schema(
  {
    profileImageUrl: {
      type: String,
      default: ''
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        let re = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$");
        if (validator.isEmpty(value)) {
          throw new Error("First name cannot be empty");
        } else if (!re.test(value)) {
          throw new Error("First name contains certain characters that aren't allowed");
        }
      },
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        let re = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$");
        if (validator.isEmpty(value)) {
          throw new Error("Last name cannot be empty");
        } else if (!re.test(value)) {
          throw new Error("Last name contains certain characters that aren't allowed");
        }
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please Enter valid email address");
        } else if (validator.isEmpty(value)) {
          throw new Error("Email cannot be empty");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (validator.isEmpty(value)) {
          throw new Error("User Password cannot be empty");
        }
        if (!validator.isLength(value, { min: 8 })) {
          throw new Error("Password must be at least 8 characters long");
        }
      },
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true });

schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

schema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user?._id.toString() }, process.env.token_key);

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

schema.statics.findByCredentials = async (email, password) => {

  const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

  if (!user) {
    throw new Error("Unable to login, Please signup first!");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login, Please enter correct password");
  }

  return user;
};
schema.methods.comparePassword = async function (userPassword) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};
schema.pre(
  "save",
  async function (next) {
    const user = this;
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }
    next();
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("Users", schema);

module.exports = User;
