import joi from 'joi';

export const usuarioCadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});

export const usuarioLoginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});