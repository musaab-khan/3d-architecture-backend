const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');  // Added for crypto randomBytes
require('dotenv').config();

module.exports = function (passport) {
  // LocalStrategy (for email/password authentication)
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          // Check if the password matches
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          // Generate JWT token
          const payload = { id: user.id, username: user.username };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

          return done(null, user, { token }); // No session management
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Google OAuth Strategy
  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //       callbackURL: '/auth/google/callback',
  //     },
  //     async (accessToken, refreshToken, profile, done) => {
  //       try {
  //         // Check if the user exists in the database using the Google ID
  //         let user = await User.findOne({ googleId: profile.id });

  //         if (!user) {
  //           // If the user does not exist, create a new user

  //           const tempPassword = crypto.randomBytes(6).toString('hex'); // Generates 12-character hex string
  //           const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

  //           user = new User({
  //             googleId: profile.id,
  //             username: profile.displayName,
  //             email: profile.emails[0].value,
  //             password: tempPassword,  // You can set a temporary password here
  //           });
  //           await user.save();
  //         }

  //         // Generate JWT token
  //         const payload = { id: user.id, username: user.username };
  //         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

  //         return done(null, user, { token }); // No session management
  //       } catch (err) {
  //         return done(err);
  //       }
  //     }
  //   )
  // );
};