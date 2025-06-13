const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      let user = await db.user.findOne({ where: { email } });

      if (!user) {
        user = await db.user.create({
          name,
          email,
          password: "google_oauth" // Placeholder (non utilisée)
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.user.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
