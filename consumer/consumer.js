const amqp = require("amqplib");

const RABBIT_URL = "amqp://admin:Admin123!@10.176.108.194:5672";
const QUEUE = "productos_creados";

async function consume() {
  try {
    console.log("📡 Conectando a RabbitMQ en:", RABBIT_URL);
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: false });

    console.log("🐰 Esperando mensajes en la cola:", QUEUE);
    console.log("Presiona Ctrl+C para salir.\n");

    channel.consume(
      QUEUE,
      (msg) => {
        const contenido = msg.content.toString();
        console.log("📩 Mensaje recibido:", contenido);
      },
      { noAck: true }
    );
  } catch (err) {
    console.error("❌ Error al conectar/consumir:", err.message);
    setTimeout(consume, 5000); // reintenta cada 5s si algo falla
  }
}

consume();
