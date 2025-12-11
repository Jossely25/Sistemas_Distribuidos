const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const amqp = require("amqplib");

const app = express();
const PORT = process.env.PORT || 3000;

// =================== CONFIG BD ===================
const DB_HOST = process.env.DB_HOST || "mariadb-master";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "app_user";
const DB_PASSWORD = process.env.DB_PASSWORD || "App123!";
const DB_NAME = process.env.DB_NAME || "ecommerce_db";

// =================== CONFIG RABBITMQ ===================
const RABBIT_URL =
  process.env.RABBIT_URL || "amqp://admin:Admin123!@rabbitmq:5672";
const RABBIT_QUEUE = "productos_creados";

let rabbitChannel = null;

async function connectRabbit() {
  try {
    console.log("Intentando conectar a RabbitMQ en", RABBIT_URL);
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(RABBIT_QUEUE, { durable: false });

    rabbitChannel = channel;
    console.log("✅ Conectado a RabbitMQ y cola creada:", RABBIT_QUEUE);

    // Si la conexión se cierra, intentamos reconectar
    connection.on("close", () => {
      console.warn("⚠ Conexión RabbitMQ cerrada, reintentando en 5s...");
      rabbitChannel = null;
      setTimeout(connectRabbit, 5000);
    });
  } catch (err) {
    console.error("❌ No se pudo conectar a RabbitMQ:", err.message);
    // Reintenta cada 5 segundos
    setTimeout(connectRabbit, 5000);
  }
}

// Lanzar el primer intento de conexión
connectRabbit();

// =================== POOL DE CONEXIÓN MYSQL ===================
const pool = mysql
  .createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  })
  .promise();

// =================== MIDDLEWARES ===================
app.use(cors());
app.use(express.json());

// =================== ENDPOINTS ===================

// Healthcheck / prueba rápida
app.get("/", (req, res) => {
  res.json({ mensaje: "API e-commerce funcionando" });
});

// GET /productos - listar todos
app.get("/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// GET /productos/:id - obtener uno
app.get("/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [
      id
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// POST /productos - crear
app.post("/productos", async (req, res) => {
  const { nombre, precio } = req.body;

  if (!nombre || precio == null) {
    return res
      .status(400)
      .json({ error: "nombre y precio son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO productos (nombre, precio) VALUES (?, ?)",
      [nombre, precio]
    );

    const nuevoProducto = {
      id: result.insertId,
      nombre,
      precio
    };

    // Enviar mensaje a RabbitMQ (si hay canal)
    if (rabbitChannel) {
      rabbitChannel.sendToQueue(
        RABBIT_QUEUE,
        Buffer.from(JSON.stringify(nuevoProducto))
      );
      console.log("📨 Mensaje enviado a cola", RABBIT_QUEUE, nuevoProducto);
    } else {
      console.warn(
        "⚠ No hay canal de RabbitMQ, no se envió el mensaje a la cola"
      );
    }

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT /productos/:id - actualizar
app.put("/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;

  if (!nombre || precio == null) {
    return res
      .status(400)
      .json({ error: "nombre y precio son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE productos SET nombre = ?, precio = ? WHERE id = ?",
      [nombre, precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ id, nombre, precio });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE /productos/:id - eliminar
app.delete("/productos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM productos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// =================== ARRANQUE SERVIDOR ===================
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
  console.log(
    `Conectando a BD en ${DB_HOST}:${DB_PORT} db=${DB_NAME} user=${DB_USER}`
  );
});

