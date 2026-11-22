const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}

// Session bootstrap is allowed without a cookie. Protected routes should keep
// using authUser so they continue to return 401 for unauthenticated requests.
async function authUserOptional(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        req.user = null
        return next()
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })
        if (isTokenBlacklisted) {
            req.user = null
            return next()
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET)
        return next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token." })
    }
}


module.exports = { authUser, authUserOptional }
