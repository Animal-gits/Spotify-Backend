const userModel = require("../models/user.model");
const jwt = require ("jsonwebtoken");
const bcrypt = require("bcryptjs")

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
}


async function registerUser(req,res) {


    const {username , email , password , role = "user"} = req.body;

    if (typeof username !== "string" || !username.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (!["user", "artist"].includes(role)) {
        return res.status(400).json({ message: "Role must be user or artist" });
    }

    const isUserAlreadyExists = await userModel.findOne({

        $or : [
            {username},
            {email}
        ]

    })

    if (isUserAlreadyExists){
        return res.status(409).json({message : "User already exists"})
    }
    
    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create ({
        username,
        email,
        password: hash,
        role
    })

    const token = jwt.sign({
        id :user._id,
        role : user.role,
        

    }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message : "User resgistered successfully",
        user :{
            id : user._id,
            username : user.username,
            email : user.email,
            role : user.role,
        }
    })
    
}

async function loginUser(req, res){


    const {username, email , password } = req.body;

    const user = await userModel.findOne({

        $or : [
            {username},
            {email}
        ]

    })

    if(!user){
        return res.status(404).json({message  : "Invalid Credentials"})
    }


    const isPasswordValid = await bcrypt.compare(password , user.password)


    if(!isPasswordValid){
        return res.status(404).json({message : "Invalid Credentials"})


    }

    const token = jwt.sign({
        id : user._id,
        role : user.role,

    }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message : "User logged in successfully",
        user : {
            id: user._id,
            username : user.username,
            email : user.email,
            role : user.role,
        }
    })

}

async function getCurrentUser(req, res) {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
}

async function updateCurrentUser(req, res) {
    const updates = {};

    if (typeof req.body.username === "string" && req.body.username.trim()) {
        updates.username = req.body.username.trim();
    }
    if (typeof req.body.email === "string" && req.body.email.trim()) {
        updates.email = req.body.email.trim();
    }

    if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "Provide a non-empty username or email" });
    }

    try {
        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username or email is already in use" });
        }
        throw error;
    }
}

function logoutUser(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });
    return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { registerUser, loginUser, getCurrentUser, updateCurrentUser, logoutUser }