import express from "express";
import cors from "cors";
import router from './routes/indexRouter.js';

const app = express();

app.use(express.json());
app.use(router);
app.use(cors());

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));