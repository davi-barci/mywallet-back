import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import bcrypt from 'bcrypt';

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
    
        await db.collection("usuarios").insertOne({ nome, email, senha: hash });
        res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));