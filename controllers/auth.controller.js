const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const User = db.user;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });

    if (exists) return res.status(400).json({ message: "User already exists" });

    await User.create({ name, email, password });
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Crée un token temporaire pour reset (valide 15 min)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_FOR_PASSWORD,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Configure le transport (exemple avec Mailtrap ou Gmail)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,   
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: '"Sourcing Support" <support@genbuilder.com>',
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Reset link sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ success: false, message: "Token or password missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_FOR_PASSWORD);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Vérifie si le mot de passe est "google_oauth"
    if (user.password === "google_oauth") {
      return res.status(400).json({ success: false, message: "OAuth accounts cannot reset password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

exports.profile = async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: ["id", "name", "email"]
  });
  res.json(user);
};
