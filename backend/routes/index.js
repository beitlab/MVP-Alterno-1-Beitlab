'use strict'

//Declaración de dependencias
const express = require('express')
const router = express.Router()
//const auth = require('../middlewares/auth')
//const userController = require('../controllers/user')
const cameraController = require('../controllers/cameras')

//Rutas
router.get('/', cameraController.CamarasListPage)

router.get('/login',(req,res)=>{
    res.status(200).send({mensaje:`Ingresaste a login`})
})

//router.get('/video',cameraController.getCameras)

//router.get('/video',auth,cameraController.getvideo)
//router.get('/video',cameraController.getvideo)

router.get('/:otro',(req,res)=>{
    res.status(404).send({mensaje:`oops! Recurso \'${req.params.otro}\' No encontrado`})
})
//router.get('/singin',userController.signIn)

module.exports = router