const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const prisma = require('./prisma/client');

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) return done(null, false, { msg: 'Username and password do not match' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { msg: 'Username and password do not match' });
      return done(null, user);
    } catch (error) {
      return done(error)
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      }
    });
    done(null, user)
  } catch (error) {
    done(error);
  }
});
