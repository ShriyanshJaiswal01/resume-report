const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");

// Enable security headers
app.use(helmet());

// Enable gzip/deflate compression
app.use(compression());

// Trust proxy if we are behind a reverse proxy like Nginx or cloud load balancer
app.set('trust proxy', 1);

// General API Rate Limiter (100 requests per 15 mins)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter Auth Rate Limiter (20 attempts per 15 mins)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        message: "Too many login/registration attempts, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/interview", generalLimiter, interviewRouter);

module.exports = app;