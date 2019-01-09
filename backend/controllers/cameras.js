//const Product = require('../models/camara');
const onvif = require('node-onvif')

var devices = {}

function CamarasListPage(req,res){
    res.render('index',{title:'Camaras'})
}

/**
 * 
 * @param {*} req la consulta http que se realiza
 * @param {*} res la respuesta que se desea enviar al cliente
 */
function getVideo(req,res){
    res.render('about',{title:'About'})
}

module.exports = {
 CamarasListPage,
 getVideo
}