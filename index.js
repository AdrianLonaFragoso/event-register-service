require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 4242;

app.use(express.json());
app.use(cors());

const sql = neon(process.env.DATABASE_URL);

// Función para obtener participantes
app.get("/participantes", async (_, res) => {
  try {
    const query = "SELECT * FROM participantes;";
    const participantes = await sql(query);
    res.json(participantes);
  } catch (error) {
    console.error("Error al obtener participantes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
