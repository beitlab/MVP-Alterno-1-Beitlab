'use strict'

//Declaración de dependecias
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const app = express()
const server = require('http').Server(app)
const morgan = require('morgan')
const path = require('path')
const io = require('socket.io')(server)    //Importa el socket.io
const cameraController = require('./controllers/cameras')
const onvif = require('node-onvif')

//Configuración body-parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Configuración de morgan
app.use(morgan('dev'))

//Motor de plantillas
app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs')

io.on('connection', (socket)=>{
    console.log(`Nuevo socket conectado ${socket.id}`)

    //Espera la peticion de busqueda de camaras OJO 1er inseguro y devuelve camaras
    var devices = {}
    socket.on('BCamaras',()=>{
        
        devices = {}
        let names = {}
        let resu = {'id':'Busqueda'}

        console.log('Start the discovery process.');
        
        // Find the ONVIF network cameras.
        // It will take about 3 seconds.
        onvif.startProbe().then((device_info_list) => {
            
            console.log(device_info_list.length + ' devices were found.');
            
            if(device_info_list.length != 0){
               
                // Show the device name and the URL of the end point.
                device_info_list.forEach((device) => {
                    let odevice = new onvif.OnvifDevice({
                        xaddr: device.xaddrs[0]
                    });

                    let addr = odevice.address;
                    devices[addr] = odevice;
                    names[addr] = device.name;
                });
                var devs = {}
                for(var addr in devices){
                    devs[addr] = {
                        name:names[addr],
                        address: addr
                    }
                }
                resu = {'camaras':devs}
            }
            else{
                resu = {'camaras':0}
            }
            socket.emit('camaras',resu)
            //Si existe algún error
            }).catch((error) => {
            console.error(error);
            resu = {'error':error.message}
            socket.emit('camaras',resu)
            });
    })

    socket.on('conectar',(params)=>{

        console.log(params)

        var device = devices[params.address];
        if(!device) {
            var res = {'id': 'conectar', 'error': 'The specified device is not found: ' + params.address};
            socket.emit('conectar',res)
            return;
        }
        if(params.user) {
            device.setAuth(params.user, params.pass);
        }
        device.init((error, result) => {
            var res = {'id': 'conectar'};
            if(error) {
                res['error'] = error.toString();
                console.log("Error en la conexión",error.toString())
            } else {
                res['result'] = result;
                console.log("Conexion Exitosa",result)
            }
            socket.emit('conectar',res)
        });
    })

    
    socket.on('transmitir',(params)=>{

        var device = devices[params.address];
        if(!device) {
            var res = {'id': 'fetchSnapshot', 'error': 'The specified device is not found: ' + params.address};
            socket.emit('imagen',res);
            console.log('Error en la identificacion de la camara')
            return;
        }
        device.fetchSnapshot((error, result) => {
            var res = {'id': 'fetchSnapshot'};
            if(error) {
                res['error'] = error.toString();
                console.log('Error en la toma de imagen de la camara')
            } else {
                var ct = result['headers']['content-type'];
                var buffer = result['body'];
                var b64 = buffer.toString('base64');
                var uri = 'data:' + ct + ';base64,' + b64;
                res['result'] = uri;
            }
            console.log('Captura imagen ok')
            socket.emit('imagen',res);
        })    
    })
});

//Rutas
app.use(require('./routes/'))

// static files
app.use(express.static(path.join(__dirname, 'public')));

module.exports = server