const express = require("express");
const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
const db = require("./models");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const userRoutes = require("./routes/user.routes");
require("dotenv").config();
// require("./auth/passport"); // Import config Passport

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Session pour Passport
// app.use(session({
//   secret: process.env.SESSION_SECRET || "keyboard_cat",
//   resave: false,
//   saveUninitialized: true
// }));

// Initialisation Passport
// app.use(passport.initialize());
// app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes)
app.use("/api/users", userRoutes);

// Lancement du serveur
const PORT = process.env.PORT || 4000;
db.sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
