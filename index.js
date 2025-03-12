require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");
// const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 4242;

app.use(express.json());
app.use(cors());

const sql = neon(process.env.DATABASE_URL);

// Función para generar código de confirmación
const generarCodigoConfirmacion = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

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

// Función para registrar un participante
app.post("/participantes", async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      correo_electronico,
      cargo,
      ciudad_origen,
      ciudad_evento,
      tipo_asistente,
    } = req.body;

    // Verificar si el correo ya está registrado
    const checkQuery =
      "SELECT * FROM participantes WHERE correo_electronico = $1;";
    const existente = await sql(checkQuery, [correo_electronico]);

    if (existente.length > 0) {
      return res
        .status(400)
        .json({ error: "El participante con este correo ya está registrado." });
    }

    const codigo_confirmacion = generarCodigoConfirmacion();

    const query = `
      INSERT INTO participantes (
        nombre, apellido_paterno, apellido_materno, correo_electronico, codigo_confirmacion, cargo, ciudad_origen, ciudad_evento, tipo_asistente
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *;
    `;

    const values = [
      nombre,
      apellido_paterno,
      apellido_materno,
      correo_electronico,
      codigo_confirmacion,
      cargo,
      ciudad_origen,
      ciudad_evento,
      tipo_asistente,
    ];

    const resultado = await sql(query, values);
    res
      .status(201)
      .json({
        message: "Participante registrado con éxito",
        participante: resultado[0],
      });
  } catch (error) {
    console.error("Error al registrar participante:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
