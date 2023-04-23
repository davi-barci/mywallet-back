import joi from 'joi';

export const transacaoSchema = joi.object({
    valor: joi.number().precision(2).positive().strict().required(),
    descricao: joi.string().required()
});