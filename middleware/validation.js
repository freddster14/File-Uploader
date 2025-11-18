const prisma = require('../prisma/client')
const { body } = require('express-validator');


const validateSignUp = [
  body('email')
    .notEmpty()
    .withMessage('Must enter email')
    .custom(async (value) => {
      const user = await prisma.user.findUnique({where: { email: value }})
      if (user) throw new Error('That email is already taken. Please choose another or log in if this is your account');
      else return true;
      }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be atleast 6 characters'),
  body('confirm-password')
    .custom((value, { req }) => {
      if(value !== req.body.password) {
        throw new Error('Passwords do not match')
      } else { return true };
    }),
];

const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Enter email'),
  body('password')
    .notEmpty()
    .withMessage('Enter password'),
];

const validateEdit = [
  body('name')
    .notEmpty()
    .withMessage('Name can not be emtpy')
    .bail()
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('First name must contain only letters, spaces, or hyphens'),
]

module.exports = { validateSignUp, validateLogin, validateEdit };
