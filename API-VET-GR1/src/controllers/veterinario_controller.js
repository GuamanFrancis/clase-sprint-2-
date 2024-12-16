import  { sendMailToUser,sendMailToRecoveryPassword } from "../config/nodemailer.js"
import {generarJWT} from "../helpers/crearjwt.js"
import Veterinario from "../models/Veterinario.js"
import mongoose from "mongoose"



const registro = async (req,res)=>{
    const {email, password} = req.body

    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos debe llenar todos los campos"})

    const verificarEmailBDD = await Veterinario.findOne({email})
    if (verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos el email ya se encuentra registrado"})
    
    //Paso 3 - Interactuar con BDD
    const nuevoVeterinario = new Veterinario(req.body)
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    const token = nuevoVeterinario.crearToken()
    await sendMailToUser(email, token)
    await nuevoVeterinario.save()
    res.status(200).json({msg: "Revisa tu correo rlectronico"})

    
}



const confirmEmail = async(req,res) => {

    const {token}=req.params

  //Paso 1 - Tomar datos del request

  if (!(token)) return res.status(400).json({msg:"Lo sentimos no se puede validar la cuenta "})

    const veterinarioBDD =  await Veterinario.findOne({token})
    if(!veterinarioBDD?.token) return res.status(400).json({msg:"La cuenta ha sido confirmada"})



  //Paso 3 - Interactuar con BDD

    //Paso 3 - Interactuar con BDD

    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail = true
    await veterinarioBDD.save()

    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
}



const login = async(req,res)=>{



    const {email,password} = req.body

    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})

    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})

    const verificarPassword = await veterinarioBDD.matchPassword(password)

    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})


    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD

    const tokenJWT =generarJWT(veterinarioBDD._id,"veterinario")
    res.status(200).json({
        nombre, 
        apellido,
        direccion,
        telefono,_id,
        tokenJWT});
    


}


const recuperarPassword =  async(req,res)=>{

    const {email} = req.body

    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    const veterinarioBDD = await Veterinario.findOne({email})

    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})



        const token = veterinarioBDD.crearToken()
        veterinarioBDD.token= token
        await sendMailToRecoveryPassword(email,token)
        await veterinarioBDD.save()
        res.status(404).json({msg:"Revisa tu correo electrónico para restablecer tu contraseña"
        })


    





}

const comprobarTokenPassword = async(req,res)=>{

    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
        if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        await veterinarioBDD.save()
      
        res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 


    
}
const nuevoPassword = async(req,res)=>{


    const{password,confirmpassword} = req.body

    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})

    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})

    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})

    veterinarioBDD.token = null

    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)

    await veterinarioBDD.save()

    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 




    
}


const perfilUsuario = (req,res) => {
  
    res.send("perfil del usuario")
}




const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email !=  req.body.email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email:req.body.email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
		veterinarioBDD.nombre = req.body.nombre || veterinarioBDD?.nombre
    veterinarioBDD.apellido = req.body.apellido  || veterinarioBDD?.apellido
    veterinarioBDD.direccion = req.body.direccion ||  veterinarioBDD?.direccion
    veterinarioBDD.telefono = req.body.telefono || veterinarioBDD?.telefono
    veterinarioBDD.email = req.body.email || veterinarioBDD?.email
    await veterinarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}


const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}






export {
    registro,
    confirmEmail,
    recuperarPassword,
    comprobarTokenPassword,
    nuevoPassword,
    login,
    perfilUsuario,
    actualizarPerfil,
    actualizarPassword
    
}