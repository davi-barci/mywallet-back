import {Router} from 'express';
import { signUp, signIn } from '../controllers/authController.js';
import { usuarioCadastroSchema, usuarioLoginSchema } from '../schemas/authSchema.js';
import { validateSchema } from '../middlewares/validateSchemaMiddleware.js';

const authRouter = Router();

authRouter.post('/cadastro', validateSchema(usuarioCadastroSchema), signUp);
authRouter.post('/', validateSchema(usuarioLoginSchema), signIn);

export default authRouter;