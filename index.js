import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

// =======================
// 🔹 Conexión a MongoDB
// =======================
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  return mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  })
}

// =======================
// 🔹 Esquema y Modelo
// =======================
const userSchema = new mongoose.Schema({
  nombre: String,
  cedula: Number,
  email: String,
  edad: Number
})

// Evita crear modelos duplicados en Vercel
const User = mongoose.models.User || mongoose.model('User', userSchema)

// =======================
// 🔹 ENDPOINTS
// =======================

// POST - crear usuario
app.post('/usuarios', async (req, res) => {
  try {
    await connectDB()
    const nuevoUsuario = new User(req.body)
    await nuevoUsuario.save()

    res.status(201).json({
      mensaje: 'Usuario creado',
      usuario: nuevoUsuario
    })
  } catch (error) {
    res.status(400).json(error)
  }
})

// GET - obtener usuarios
app.get('/usuarios', async (req, res) => {
  try {
    await connectDB()
    const usuarios = await User.find()
    res.json(usuarios)
  } catch (error) {
    res.status(500).json(error)
  }
})

// PUT - actualizar por cédula
app.put('/usuarios/:cc', async (req, res) => {
  try {
    await connectDB()
    const cedula = Number(req.params.cc)

    const usuario = await User.findOneAndUpdate(
      { cedula },
      req.body,
      { new: true, runValidators: true }
    )

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    }

    res.json({
      mensaje: 'Usuario actualizado',
      usuario
    })
  } catch (error) {
    res.status(400).json(error)
  }
})

// DELETE - eliminar por cédula
app.delete('/usuarios/:cc', async (req, res) => {
  try {
    await connectDB()
    const cedula = Number(req.params.cc)

    const usuario = await User.findOneAndDelete({ cedula })

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    }

    res.json({
      mensaje: 'Usuario eliminado',
      usuario
    })
  } catch (error) {
    res.status(400).json(error)
  }
})

// =======================
// 🔹 Exportar app (sin listen)
// =======================
export default app
