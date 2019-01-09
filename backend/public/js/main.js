var socket = io.connect(`http://${document.location.host}`)

//Elemetos DOM del Documento
var DOM = {
    'sel' : document.getElementById('device'),
    'formConn' :  document.getElementById("connect-form"),
    'user':   document.getElementById('user'),
    'pass':   document.getElementById('pass'),
    'BtnCon' : document.getElementById("connect"),
    'conected': document.getElementById("connected-device"),
    'img' : document.getElementById("snapshot")
}

//Variables globales
var selected_address = '';
var device_connected = false;
var ptz_moving = false;
var snapshot_w = 400;
var snapshot_h = 300;

socket.emit('BCamaras',{})

socket.on('camaras',(data)=>{
    console.log(data.camaras)
    var option = document.createElement("option")

    console.log(data.camaras.length)

    if(data.camaras != 0){
        option.text = "Seleccione una camara"    
        DOM['sel'].options.length = 0
        DOM['sel'].add(option)

        for(var key in data.camaras) {
            var device = data.camaras[key];
            var option1 = document.createElement("option")
            option1.value = device.address;
            option1.text = device.name + ' (' + device.address + ')';
            DOM['sel'].add(option1)
        }
        
        DOM['sel'].disabled = false
        DOM['BtnCon'].disabled = false
    }
    else{
        option.text = "No se encontraron camaras"
        DOM['sel'].options.length = 0
        DOM['sel'].add(option)
    }
})

socket.on('conectar',(data)=>{
    if(data.result) {
		selected_address = DOM['sel'].value;
        DOM['formConn'].hidden = true;
        DOM['conected'].hidden = false;
        DOM['conected'].style.display = 'block'; 
        device_connected = true;
        socket.emit('transmitir',{
            'address': selected_address
        })

	} else if(data.error) {
		desconectar(this);
		device_connected = false;
	}
})

socket.on('imagen',(data)=>{
    if(data.result) {
        DOM['img'].src = data.result;
        window.setTimeout(function() {
          snapshot_w = DOM['img'].naturalWidth;
          snapshot_h = DOM['img'].naturalHeight;
          adjustSize();
          socket.emit('transmitir',{'address': selected_address})
        }.bind(this), 10);
      } else if(data.error) {
        console.log(data.error);
      }

})

function conectar(e){
    if(this.device_connected === true) {
		desconectar(this);
	} else {

        socket.emit('conectar',{
            'address': DOM['sel'].value,
            'user': DOM['user'].value,
            'pass': DOM['pass'].value
        })   
    }
    return false;
}

function desconectar(e){
    DOM['formConn'].hidden = false;
    DOM['conected'].hidden = true;
    DOM['conected'].style.display = 'none';
    DOM['BtnCon'].title = "Conectar";
    this.device_connected = false;
    return false;
}

function adjustSize(){
	var div_dom_el = DOM['conected'];
	var rect = div_dom_el.getBoundingClientRect() ;
	var x = rect.left + window.pageXOffset;
	var y = rect.top + window.pageYOffset;
	var w = rect.width;
	var h = window.innerHeight - y - 10;
	div_dom_el.style.height = h + 'px';
	var aspect_ratio = w / h;
	var snapshot_aspect_ratio = snapshot_w / snapshot_h;
	var img_dom_el = DOM['img'];

	if(snapshot_aspect_ratio > aspect_ratio) {
		img_w = w;
		img_h = (w / snapshot_aspect_ratio);
		img_dom_el.style.width = img_w + 'px';
		img_dom_el.style.height = img_h + 'px';
		img_dom_el.style.left = '0px';
		img_dom_el.style.top = ((h - img_h) / 2) + 'px';
	} else {
		img_h = h;
		img_w = (h * snapshot_aspect_ratio);
		img_dom_el.style.height = img_h + 'px';
		img_dom_el.style.width = img_w + 'px';
		img_dom_el.style.left = ((w - img_w) / 2) + 'px';
		img_dom_el.style.top = '0px';
	}
}
