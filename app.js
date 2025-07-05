const express = require("express");
const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
const db = require("./models");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const userRoutes = require("./routes/user.routes");
const adminAuthRoutes = require("./routes/auth.routes");
const template = require('./routes/template.routes')
// const { OpenAI } = require('openai')
require("dotenv").config();
const axios = require('axios')
// require("./auth/passport"); // Import config Passport

const app = express();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100mb' }));

// app.post('/api/chat', async (req, res) => {
//   const { message } = req.body

//   try {
//     const response = await axios.post('https://mon-api-landing-page.onrender.com/generate-landing-page', {
//       // model: 'gemma3',
//       prompt: message,
//       // stream: false
//     })
//     const reply = response.data
//     res.json({ reply })
//   } catch (error) {
//     console.error('erreur OPENAI', error)
//     res.status(500).json({error: 'response generation failedcd B'})
//   }
// })

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
app.use("/api/admin", adminAuthRoutes);
app.use('/api/templates', template)

app.use('/api/ia', () => {

})

// Lancement du serveur
const PORT = process.env.PORT || 4000;
db.sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
