import dayjs from "dayjs";
import { db } from '../database.js';

export async function newTransaction (req, res) {
    const { tipo } = req.params;
    const {valor, descricao} = req.body;  

    try {
        await db.collection("transacoes").insertOne({
            usuarioId: res.locals.session.usuarioId,
            valor: valor,
            descricao: descricao,
            tipo: tipo,
            data: dayjs().format("DD/MM"),
        });
        res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

export async function getTransactions (req, res) { 
    try {        
        const transacoes = await db.collection("transacoes").find({usuarioId: res.locals.session.usuarioId}).toArray();
        res.send(transacoes).status(200);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
