import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs";

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))

const usuarioCadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});
    
app.post("/cadastro", async (req, res) => {
    const { nome, email, senha } = req.body;
    
    const validation = usuarioCadastroSchema.validate(req.body, { abortEarly: false });
    
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    
    try {
        const usuario = await db.collection("usuarios").findOne({ email });
        if (usuario) return res.status(409).send("E-mail já cadastrado");
        
        const hash = bcrypt.hashSync(senha, 10);
    
        await db.collection("usuarios").insertOne({ nome: nome, email: email, senha: hash });
        return res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

const usuarioLoginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});

app.post("/", async (req, res) => {
    const { email, senha } = req.body;

    const validation = usuarioLoginSchema.validate(req.body, { abortEarly: false });
    
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    
    try{
        const usuario = await db.collection("usuarios").findOne({ email: email });
        if (!usuario) return res.sendStatus(404);

        if(bcrypt.compareSync(senha, usuario.senha)) {
            const token = uuid();
            
            await db.collection("sessions").insertOne({usuarioId: usuario._id, token: token})
            return res.send(token).status(200);
        }else{
            return res.sendStatus(401);
        }
    } catch (err) { 
        return res.status(500).send(err.message);
    }
});

const transacaoSchema = joi.object({
    valor: joi.number().precision(2).positive().strict().required(),
    descricao: joi.string().required()
});

app.post("/nova-transacao/:tipo", async (req, res) => {
    const { tipo } = req.params;
    const {valor, descricao} = req.body;  
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if(!token) return res.sendStatus(401);

    const validation = transacaoSchema.validate(req.body, { abortEarly: false });
    
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const session = await db.collection("sessions").findOne({ token: token });
        if (!session) return res.sendStatus(401);
        
        await db.collection("transacoes").insertOne({
            usuarioId: session.usuarioId,
            valor: valor,
            descricao: descricao,
            tipo: tipo,
            data: dayjs().format("DD/MM"),
        });
        res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));