const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function registerUserController(req, res) {
    const { userName, email, password } = req.body

    if(!userName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide username, email, password"
        })
    }

    const userAlreadyExist = await userModel.findOne({
        $or: [ {userName}, {email} ]
    })
    if(userAlreadyExist) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        userName,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, userName: user.userName, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        },
        token
    })

}

async function loginUserController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if(!user) { 
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })
    } 

    const isPasswordValid = await bcrypt.compare(password, user.password) 

    if(!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, userName: user.userName, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    ) 

    res.cookie("token", token)

    res.status(200).json({  
        message: "User logged in successfully",
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        },
        token
    })
}

async function logoutUserController(req, res) {
    const token = req.cookies.token

    if(token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        }
    })
}

module.exports = {
    registerUserController, 
    loginUserController, 
    logoutUserController,
    getMeController
}