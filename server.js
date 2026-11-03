import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "calculadora.db"));
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "troque-esta-chave-em-producao";

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, senha_hash TEXT NOT NULL, criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS simulacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id TEXT NOT NULL, profissao TEXT NOT NULL, renda REAL NOT NULL, custos REAL NOT NULL, folha REAL NOT NULL DEFAULT 0, fator_r REAL, anexo TEXT, total_pf REAL NOT NULL, total_pj REAL NOT NULL, mais_vantajoso TEXT NOT NULL, dados_json TEXT NOT NULL, criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
`);

app.use(express.json({ limit: "100kb" }));
app.use(cors({ origin: "http://localhost:5173" }));
const hash = (senha) => crypto.scryptSync(senha, "naf-calculadora", 64).toString("hex");
const clientId = (req) => String(req.header("x-client-id") || "").slice(0, 100);

app.post("/register", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  try {
    const result = db.prepare("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)").run(nome.trim(), email.trim().toLowerCase(), hash(senha));
    res.status(201).json({ message: "Usuário registrado com sucesso.", userId: Number(result.lastInsertRowid) });
  } catch (error) { res.status(error.message.includes("UNIQUE") ? 409 : 500).json({ message: error.message.includes("UNIQUE") ? "E-mail já registrado." : "Não foi possível criar o usuário." }); }
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const user = db.prepare("SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?").get(String(email || "").trim().toLowerCase());
  if (!user || user.senha_hash !== hash(String(senha || ""))) return res.status(401).json({ message: "Credenciais inválidas." });
  const publicUser = { id: user.id, nome: user.nome, email: user.email };
  res.json({ message: "Login bem-sucedido.", token: jwt.sign(publicUser, SECRET_KEY, { expiresIn: "1h" }), user: publicUser });
});

app.post("/api/simulacoes", (req, res) => {
  const id = clientId(req); const simulation = req.body;
  if (!id || !simulation?.inputs || !simulation?.pf || !simulation?.pj) return res.status(400).json({ message: "Simulação inválida." });
  const { inputs, fatorR, anexo, pf, pj, maisVantajoso } = simulation;
  const result = db.prepare("INSERT INTO simulacoes (client_id, profissao, renda, custos, folha, fator_r, anexo, total_pf, total_pj, mais_vantajoso, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, inputs.profissao, inputs.renda, inputs.custos, inputs.folha || 0, fatorR ?? null, anexo || null, pf.total, pj.total, maisVantajoso, JSON.stringify(simulation));
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});
app.get("/api/simulacoes", (req, res) => {
  const id = clientId(req); if (!id) return res.status(400).json({ message: "Identificador do navegador ausente." });
  const rows = db.prepare("SELECT id, dados_json, criado_em FROM simulacoes WHERE client_id = ? ORDER BY id DESC").all(id);
  res.json(rows.map((row) => ({ id: row.id, criadoEm: row.criado_em, ...JSON.parse(row.dados_json) })));
});
app.delete("/api/simulacoes/:id", (req, res) => { const result = db.prepare("DELETE FROM simulacoes WHERE id = ? AND client_id = ?").run(Number(req.params.id), clientId(req)); res.status(result.changes ? 204 : 404).end(); });

app.post("/send-email", async (req, res) => {
  const { nome, email, mensagem } = req.body;
  if (!nome || !email || !mensagem) return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.NAF_EMAIL) return res.status(503).json({ message: "E-mail não configurado. Preencha EMAIL_USER, EMAIL_PASS e NAF_EMAIL no arquivo .env." });
  try { const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } }); await transporter.sendMail({ from: process.env.EMAIL_USER, to: process.env.NAF_EMAIL, replyTo: email, subject: `[NAF] Dúvida de ${nome}`, text: mensagem }); res.json({ message: "Mensagem enviada ao NAF." }); } catch { res.status(500).json({ message: "Não foi possível enviar a mensagem." }); }
});
app.listen(PORT, () => console.log(`API com SQLite em http://localhost:${PORT}`));
