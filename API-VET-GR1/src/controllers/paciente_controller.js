
import { sendMailToPaciente } from "../config/nodemailer.js"
import Paciente from "../models/Paciente.js"




const listarPacientes = async (req,res)=>{

    //const pacientes = await Pacientes.find({estado:true}).where('veterinario').equals(req.veterinarioBDD).select("-salida -createAt -updateAt -__v")

    const pacientes = await Paciente.find({estado:true}).populate('veterinario',"nombre").select("-estado -__v").where('veterinario').equals(req.veterinarioBDD)
    res.status(200).json(pacientes)

}



const loginPaciente = async(req,res)=>{
    res.send("Paciente logeado")
}


const perfilPaciente =(req,res)=>{
    res.send("Paciente perfil")
}


const actualizarPaciente = async(req,res)=>{
    res.send("Paciente actualizado")
   
}


const eliminarPaciente = async (req,res)=>{
    res.send("Paciente Eliminado")
}

const Registrarpaciente = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Paciente.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoPaciente = new Paciente(req.body)
    const password = Math.random().toString(36).slice(2)
    nuevoPaciente.password = await nuevoPaciente.encrypPassword("vet"+password)
    await sendMailToPaciente(email,"vet"+password)
    nuevoPaciente.veterinario=req.veterinarioBDD._id
    await nuevoPaciente.save()
    res.status(200).json({msg:"Registro exitoso del paciente y correo enviado"})
}

const detallePaciente = async (req,res)=>{
    res.send("Detalles Paciente ")
}


export{
listarPacientes,
loginPaciente,
detallePaciente,
perfilPaciente,
actualizarPaciente,
eliminarPaciente,
Registrarpaciente,
}