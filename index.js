import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// 🔹 Cargar variables de entorno
dotenv.config()

const app = express()
app.use(express.json())

// 🔹 Esquema y modelo
const userSchema = new mongoose.Schema({
  nombre: String,
  cedula: Number,
  email: String,
  edad: Number
})

const User = mongoose.model('User', userSchema)

// 🔹 Conexión a MongoDB (evita múltiples conexiones en Vercel)
const mongoUri = process.env.MONGO_URI

if (!mongoUri) {
  throw new Error('❌ MONGO_URI no está definida en las variables de entorno')
}

if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error MongoDB:', err))
}

// ================= ENDPOINTS =================

// POST - crear usuario
app.post('/usuarios', async (req, res) => {
  try {
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
    const usuarios = await User.find()
    res.json(usuarios)
  } catch (error) {
    res.status(500).json(error)
  }
})

// PUT - actualizar por cédula
app.put('/usuarios/:cc', async (req, res) => {
  try {
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

// 🔹 EXPORTAR app (NO listen)
export default app