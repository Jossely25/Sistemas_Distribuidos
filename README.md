# Distributed Task Processing System ⚙️

Proyecto desarrollado para la asignatura de **Sistemas Distribuidos**, implementando una arquitectura basada en microservicios para el procesamiento asíncrono de tareas mediante colas de mensajes.

La solución utiliza **RabbitMQ** para la comunicación entre servicios, **Redis** para almacenamiento temporal, **MongoDB** para persistencia de datos y **Docker** para facilitar el despliegue de toda la infraestructura.

---

# Características

- Arquitectura basada en microservicios.
- Comunicación asíncrona mediante RabbitMQ.
- API REST desarrollada con Node.js.
- Procesamiento desacoplado mediante un Consumer.
- Persistencia de datos en MongoDB.
- Uso de Redis como almacenamiento en memoria.
- Contenedorización con Docker.
- Fácil escalabilidad de los servicios.

---

# Tecnologías utilizadas

- Node.js
- Express
- RabbitMQ
- Redis
- MongoDB
- Docker
- Docker Compose

---

# Arquitectura

```text
                  Cliente
                     │
                     ▼
             Backend (Express API)
                     │
                     ▼
               RabbitMQ Queue
                     │
                     ▼
                 Consumer
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    MongoDB                  Redis
```

### Flujo del sistema

1. El cliente envía una solicitud a la API REST.
2. El Backend valida la información recibida.
3. La tarea es publicada en RabbitMQ.
4. El Consumer escucha continuamente la cola.
5. El Consumer procesa la información recibida.
6. Los resultados son almacenados en MongoDB y, cuando es necesario, se utilizan datos temporales en Redis.
7. La información queda disponible para futuras consultas.

---

# Estructura del proyecto

```text
distributed-task-processing-system/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── app.js
│
├── consumer/
│   ├── consumer.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
│
├── README.md
│
└── Arquitectura.png
```

---

# Componentes

## Backend

Ubicación:

```
backend/
```

Responsabilidades:

- Exponer la API REST.
- Recibir las solicitudes del cliente.
- Publicar mensajes en RabbitMQ.
- Validar la información antes del envío.

Archivo principal:

```
src/app.js
```

---

## Consumer

Ubicación:

```
consumer/
```

Responsabilidades:

- Escuchar continuamente la cola de RabbitMQ.
- Procesar cada mensaje recibido.
- Ejecutar la lógica del negocio.
- Guardar los resultados en MongoDB.

Archivo principal:

```
consumer.js
```

---

## RabbitMQ

Se utiliza como broker de mensajes para desacoplar el Backend del Consumer.

Funciones:

- Recepción de tareas.
- Almacenamiento temporal de mensajes.
- Entrega confiable de mensajes.
- Comunicación asíncrona.

---

## Redis

Utilizado como almacenamiento en memoria para mejorar el rendimiento del sistema.

Permite:

- Cache de información.
- Datos temporales.
- Reducción de consultas repetitivas.

---

## MongoDB

Responsable de la persistencia de la información procesada por el Consumer.

Almacena:

- Registros procesados.
- Historial de tareas.
- Resultados del procesamiento.

---

# Requisitos

Antes de ejecutar el proyecto es necesario contar con:

- Docker
- Docker Compose
- Node.js 18 o superior (opcional para desarrollo local)
- Git

---

# Instalación

## Clonar el repositorio

```bash
git clone https://github.com/USUARIO/distributed-task-processing-system.git
```

Ingresar al proyecto

```bash
cd distributed-task-processing-system
```

---

# Ejecución con Docker

Levantar todos los servicios:

```bash
docker compose up --build
```

Ejecutar en segundo plano:

```bash
docker compose up -d
```

Detener los servicios:

```bash
docker compose down
```

---

# Ejecución local

## Backend

```bash
cd backend

npm install

npm start
```

---

## Consumer

```bash
cd consumer

npm install

node consumer.js
```

---

# Variables de entorno

Crear un archivo `.env` para configurar las conexiones del sistema.

Ejemplo:

```env
PORT=3000

RABBITMQ_URL=amqp://rabbitmq

REDIS_HOST=redis

MONGO_URI=mongodb://mongo:27017/distributed_db
```

---

# Organización del proyecto

| Carpeta | Descripción |
|----------|-------------|
| `backend/` | API REST encargada de recibir las solicitudes del cliente. |
| `consumer/` | Servicio que procesa las tareas provenientes de RabbitMQ. |
| `docker-compose.yml` | Configuración completa de la infraestructura. |
| `Arquitectura.png` | Diagrama general del sistema distribuido. |

---

# Ventajas de la arquitectura

- Desacoplamiento entre servicios.
- Comunicación asíncrona.
- Escalabilidad horizontal.
- Mayor tolerancia a fallos.
- Procesamiento eficiente de tareas.
- Fácil mantenimiento.
- Infraestructura portable mediante Docker.

---

# Capturas

Puedes agregar imágenes como:

```text
docs/arquitectura.png

docs/api.png

docs/rabbitmq.png

docs/mongodb.png

docs/docker.png
```

---

# Autor

**Jossely Elena Aguirre Acuña**

---

# Licencia

Proyecto desarrollado con fines académicos para la asignatura de **Sistemas Distribuidos**, implementando una arquitectura distribuida basada en microservicios, colas de mensajes y procesamiento asíncrono.
