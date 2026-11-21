const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes')
const musicRoutes = require('./routes/music.routes')



const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = new Set([
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim()) : [])
]);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
    }

    return next();
});


app.use('/api/auth',authRoutes);
app.use('/api/music', musicRoutes);


module.exports = app;