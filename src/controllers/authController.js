import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../database.js';

export async function signUp (req, res) {
    const { nome, email, senha } = req.body;
    
    try {
        const usuario = await db.collection("usuarios").findOne({ email });
        if (usuario) return res.status(409).send("E-mail já cadastrado");
        
        const hash = bcrypt.hashSync(senha, 10);
    
        await db.collection("usuarios").insertOne({ nome: nome, email: email, senha: hash });
        return res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

export async function signIn (req, res) {
    const { email, senha } = req.body;
    
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
};