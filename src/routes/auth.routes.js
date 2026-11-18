const { Router } = require('express');
const { registerUserController, loginUserController, logoutUserController } = require('../cotrollers/auth.controller');

const authRouter = Router();

authRouter.post('/register', registerUserController);

authRouter.post('/login', loginUserController);

authRouter.get("/logout", logoutUserController);

module.exports = authRouter;