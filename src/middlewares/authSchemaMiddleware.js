import { db } from "../database.js";

export async function authValidation(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if(!token) return res.sendStatus(401);

    try {
        const session = await db.collection("sessions").findOne({ token: token });
        if (!session) return res.sendStatus(401);
        res.locals = {session};
        next();
    } catch (err) {
        return res.status(500).send(err.message);
    }
}