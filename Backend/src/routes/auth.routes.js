const { Router } = require('express');
const { registerUserController, loginUserController, logoutUserController, getMeController } = require('../cotrollers/auth.controller');
const authMiddleware = require("../middlewares/auth.middleware")
const authRouter = Router();

authRouter.post('/register', registerUserController);

authRouter.post('/login', loginUserController);

authRouter.get("/logout", logoutUserController);

authRouter.get("/get-me", authMiddleware, getMeController);

module.exports = authRouter; 