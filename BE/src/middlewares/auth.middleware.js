const jwt = require('jsonwebtoken');

function authenticate(req, res, next, allowedRoles) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "You don't have access" });
    }

    req.user = decoded;
    return next();
}

function authArtist(req, res, next) {
    return authenticate(req, res, next, ["artist"]);
}

function authUser(req, res, next) {
    return authenticate(req, res, next, ["user"]);
}

function authAny(req, res, next) {
    return authenticate(req, res, next, ["user", "artist"]);
}

module.exports = { authArtist, authUser, authAny };
