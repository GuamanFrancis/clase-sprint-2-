import {Router} from 'express'
import { actualizarPassword, actualizarPerfil, comprobarTokenPassword, confirmEmail, login, nuevoPassword, perfilUsuario, recuperarPassword, registro } from '../controllers/veterinario_controller.js'
import { verificarAutenticacion } from '../helpers/crearjwt.js'


const router = Router()


//Rutas publicas
router.post('/registro',registro)

router.get('/confirmar/:token',confirmEmail)

router.post('/login',login)

router.post('/recuperar-password',recuperarPassword)

router.get('/recuperar-password/:token',comprobarTokenPassword)

router.post('/nuevo-password/:token',nuevoPassword)
//Rutas Privadas

router.get('/perfilvet',verificarAutenticacion,perfilUsuario)
router.put('/veterinaria/actualizar/:id',verificarAutenticacion,actualizarPerfil)
router.put('/veterinario/cambiarpassword',verificarAutenticacion,actualizarPassword)


export default router