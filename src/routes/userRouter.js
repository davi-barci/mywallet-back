import {Router} from 'express';
import { newTransaction, getTransactions } from '../controllers/userController.js';
import { transacaoSchema } from "../schemas/userSchema.js";
import { validateSchema } from '../middlewares/validateSchemaMiddleware.js';
import { authValidation } from '../middlewares/authSchemaMiddleware.js';

const userRouter = Router();

userRouter.use(authValidation);
userRouter.post("/nova-transacao/:tipo", validateSchema(transacaoSchema), newTransaction);
userRouter.get("/home", getTransactions);

export default userRouter;