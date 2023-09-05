
function makeid(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}
class Adress {
	//ademasd de controllar al direccion manejaresmos el mapa desde esta clase
	constructor({ map, idMap }) {
		this.map = map
		this.idMap = idMap
		this.origen = { lat: 6.3017314, lng: -75.5743796 }
		this.bounds = {
			north: this.origen.lat + .5,
			south: this.origen.lat - .5,
			east: this.origen.lng + .5,
			west: this.origen.lng - .5,
		}
		this.stringAdress = ``
		this.cost
		this.durationAprox
		this.dataMatrix
		this.inputAdress = ''
		this.type
		this.timeObj = {}
		this._coordinates = {}
		this.mapConfig = {
			center: this.origen,
			zoom: 18,
			disableDefaultUI: true,
			mapTypeControl: false,
			mapTypeControlOptions: {
				///style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
				mapTypeIds: ["roadmap", "terrain"],
			},
			restriction: {
				latLngBounds: this.bounds, //area de busqueda
				strictBounds: true,

			},
		}
		this.valid = false

	}
	setConfig() {
		const elementMap = document.getElementById(this.idMap)
		this.map = new google.maps.Map(elementMap, this.mapConfig);
	}
	initplacesAutocomplete(idInputAdrres, callback = () => { }) {//el calback es cuanos se establesca  una direcion
		const autocompleteInput = document.getElementById(idInputAdrres)
		//ponemos desde el inico el mensage de  invalido
		autocompleteInput.setCustomValidity("Por favor, ingresa una dirección de correo electrónico válida.");
		console.log(`desvalidamos el input ${autocompleteInput.checkValidity()}`)

		//creamos la funcionalidad del input atocompletes
		const autocomplete = this.initAutocomplete(autocompleteInput)

		autocompleteInput.addEventListener('input', async () => {
			this.inputAdress = autocompleteInput.value
			this.valid = false
			//desvalidamos el input 
			autocompleteInput.setCustomValidity("Por favor, ingresa una dirección de correo electrónico válida.");
			console.log(`desvalidamos el input ${autocompleteInput.checkValidity()}`)
			//apagamos el mapa y lo receteamos
			this.mostrarOculatarMapa(false)
			this.setConfig()
		})

		//cada ves que pasa el evento de seleccion dierrecon 'place_changed' se ejecutara esto 
		autocomplete.addListener('place_changed', async () => {
			//ponemos le input del autocomplet como valido 
			autocompleteInput.setCustomValidity("");
			let place = autocomplete.getPlace();
			if (place?.geometry) {
				this.valid = true

				console.log('[onPlaceChanged] place.geometry true ')
				await this.setAdress({ value: place })
				callback()
				return
			} else {
				console.error(`hay un error, no se pudo sacar las cordenadas de esta direccion, place:`)
				console.error(place);
			}
		})

	}
	onPlaceChanged(autoComplete, callback) {
		console.log('[onPlaceChanged]')
		let place = autoComplete.getPlace();

		// Verificar si la dirección es válida y completa
		if (place?.geometry) {
			console.log('[onPlaceChanged] place.geometry true ')
			return callback(place)
		}
		else {
			console.log('[onPlaceChanged] place.geometry false ')
			return callback(null, true)
		}
	}
	initAutocomplete(autocompleteInput) {
		const autocomplete = new google.maps.places.Autocomplete(
			autocompleteInput, {
			// types: ['address'],
			bounds: this.bounds,
			strictBounds: true, // especifica si la API debe mostrar solo los lugares que están estrictamente dentro de la región definida por el bounds especificado
			componentRestrictions: { 'country': ['CO'] },
			fields: ['geometry', 'name', 'formatted_address', 'type', 'address_components'],

		})
		console.log(`campo autocomplete activado`);
		//cada ves que se haga un cambio en el input de google maps

		return autocomplete
	}

	async setAdress({ type = `placesAutocomplete`, value }) {
		this.type = type
		if (type == 'placesAutocomplete') {
			//mostramos el mapa
			this.mostrarOculatarMapa(true)
			const place = value

			this.address_complete = place.formatted_address

			const cordenadas = {
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng()
			}
			//establesemos la cordenadas de la direccin que recibimos del autocompletado
			this._coordinates = cordenadas
			//establemos los demas paramerro

			//calculamos la distandi y el precio del domicilio con la api de maps
			await this.setDomicilo(this._coordinates)

			//debemos de mostrar en el mapa
			//centramos el mapa 
			this.map.setCenter(this._coordinates)

			const title = `
			<b>¿Estoy aqui?</b>
			asigurate que la direccion coincida con el mapa
			`
			this.mostrarMake({ coordinates: this._coordinates, title: title, body: '' })
		}
	}
	set coordinates({ lat, lng }) {
		if (typeof (lat) !== `number`) throw `lat debe de ser un numero`
		if (typeof (lng) !== `number`) throw `lng debe de ser un numero`
		this._coordinates = {
			lat: lat,
			lng: lng,
		}
	}
	async setDomicilo() {
		console.log("🚀 ~ file: formularioPedidosV2.js:164 ~ Adress ~ setDomicilo ~ setDomicilo:",)
		//calculamos la distancia
		const matrixDistancia = await this.calcularDistancia()
		this.dataMatrix = matrixDistancia
		this.calcularPrecio(this.dataMatrix.distance.value)

	}
	calcularDistancia() {
		return new Promise((resolve, reject) => {
			// Crear una instancia de la clase DistanceMatrixService
			var service = new google.maps.DistanceMatrixService();
			// Define el modo de transporte (en este caso "MOTORCYCLE" para moto).
			var modoTransporte = google.maps.TravelMode.TWO_WHEELER;

			const callback = (response, status) => {
				if (status == "OK") {
					const dataMatrix = response.rows[0].elements[0]
					console.log("La distancia es: ", dataMatrix);
					// this.dataMatrix = dataMatrix
					resolve(dataMatrix)
				} else {
					reject()
					// console.log("Error al calcular la distancia: " + status);
				}
			}

			// Envía una solicitud a DistanceMatrixService.
			service.getDistanceMatrix(
				{
					origins: [this.origen],
					destinations: [this._coordinates],
					travelMode: modoTransporte,
					unitSystem: google.maps.UnitSystem.METRIC,
					avoidHighways: false,
					avoidTolls: false,
					durationInTraffic: true, // Incluir tráfico en el cálculo

				},
				// En la respuesta, extrae la información de distancia.
				callback
			)
		})

	}
	calcularPrecio(distanceMtr) {
		let prece = (Math.round((distanceMtr) / 1000) * 1000) + 1000

		if (prece < 3000) {
			prece = 3000
		} else if (prece < 5500) {
			prece = 5000
		}

		if (distanceMtr <= 100) {
			prece = 0
		}
		this.cost = prece
		return prece

	}
	calcularTiempo(durationMin) {
		const durationParse = parseInt(durationMin / 60 + 15) + ' minutos aprox'
		this.durationAprox = durationParse
		return durationMin
	}
	mostrarMake({ coordinates, title, body }) {
		const marker = new google.maps.Marker({
			position: coordinates,
			animation: google.maps.Animation.DROP,
			map: this.map,
			title: title,
			body: body,
			optimized: false,
		})
		//activamos de una ves el make
		setTimeout(this.mostrarMaker(marker), 500)
		marker.addListener("click", this.mostrarMaker(marker))
		return marker
	}
	mostrarOculatarMapa(estado) {
		var elemento = document.getElementById(this.idMap)

		if (estado) {
			elemento.style.removeProperty("display");
			elemento.style.display = "block";
			elemento.style = 'height: 200px;'//le  ponemos una altura para que siempre se rederise

		} else {
			elemento.style.removeProperty("display");
			elemento.style.display = "none";
		}
	}
	minDistance() {
		return parseInt(this.dataMatrix.duration.value / 60)
	}
	mostrarMaker(marker) {
		console.log('[mostrarMaker]')
		const infoWindow = new google.maps.InfoWindow();

		return () => {
			infoWindow.close()
			infoWindow.setContent(marker.getTitle())
			infoWindow.open(marker.getMap(), marker)
		}
	}
}

class Pedido {
	constructor({
		cliente = {},
		productos = [],
		direccion = {},
		datosExtra = {},
		adiciones = []
	}) {
		this.cliente = cliente
		this.productos = productos
		this.direccion = direccion
		this.datosExtra = datosExtra
		this.adiciones = adiciones

		this.idCantidaProducto = {
			Combo: `cantidadCombo`,
			Hamburguesa: `cantidadHamburguesa`,
		}
		this.idTbody = `tbodyId`

		//asignaicon de la url de la api
		let pedidosPostApi = 'https://domiburguer.com/api/pedidos'
		if (window.origin.includes('127.0.0.1') || window.origin.includes('localhost')) pedidosPostApi = `http://localhost:8087/api/pedidos`
		this.urlApi = pedidosPostApi

	}
	agregarProducto(producto) {
		this.productos.push(producto)
		this.renderisarCambios()

	}
	retirarProducto({ type, index, name }) {
		//buscamos el index del proucto que nos pieden retirar
		let indexProducto
		if (type !== undefined) {
			indexProducto = this.productos.findIndex(producto => producto.type == type)
		}
		if (name !== undefined) {
			indexProducto = this.productos.findIndex(producto => producto.name == name)
		}
		if (index !== undefined) {
			indexProducto = index
		}

		if (indexProducto <= -1) throw `no se encontro ningun prouduc que cumple con las condiciones de busqueda`
		this.productos.splice(indexProducto, 1)
		this.renderisarCambios()

	}
	renderisarCambios() {
		this.renderisarCantidadProducto()
		this.renderisarResumen()
	}
	renderisarCantidadProducto() {
		//hacemos un filtro de lasl haburguesas  y combos que hay
		const cantidadCombo = this.productos.filter(producto => producto.id == `1`)
		const cantidadHamburguesa = this.productos.filter(producto => producto.id == `2`)

		const valueCombo = document.getElementById(this.idCantidaProducto.Combo)
		valueCombo.value = cantidadCombo.length

		const valueHamburguesa = document.getElementById(this.idCantidaProducto.Hamburguesa)
		valueHamburguesa.value = cantidadHamburguesa.length
	}
	renderisarResumen() {
		const tbody = document.getElementById(this.idTbody)

		let rtaResumen = this.productos.reduce((acomulador, producto) => {
			const price = this.calcularPrecioTotalProducto(producto)
			const objMas = this.establecerMas(producto)
			const data = {
				nombre: producto.name,
				mas: objMas,
				precio: price
			}
			const tr = this.crearTb(data)
			return acomulador += tr
		}, ``)

		const rtaResumenDireccion = this.renderisarResumenDireccion()

		const rtaResumenTotal = this.renderisarResumenTotal()

		rtaResumen += rtaResumenDireccion + rtaResumenTotal

		tbody.innerHTML = rtaResumen

	}
	establecerMas(producto) {
		//son las opciones de todos las adiciones
		const adiconesOptions = this.adiciones.reduce((acc, adicion) => {

			return acc += `<option value="${adicion.id}">${adicion.name}</option>`
		}, ``)

		let opcionsDiv = `<option selected disabled >Adiciones</option>${adiconesOptions}`

		let resumenBad = producto.modifique.reduce((acc, modifique, i) => {
			return acc += `<span id="divSpanBadge${modifique.idInter}" onclick="retirarAdicionSelect('${producto.idInter}', '${modifique.idInter}')" class="badge etiqueta" style="background-color: ${modifique.colorPrimary}"><div>${modifique.name}</div></span>`
		}, ``)

		let selectAdiciones = `
		<div>
			<select class="form-select form-select-sm" style="width: 8rem;" id="selectAdiciones${producto.idInter}" 
				onchange="anadirAdicionSelect(this, '${producto.idInter}')" >
				${opcionsDiv}
			</select>
			<div name="divReposoAdicines" id="divSelect${producto.idInter}">${resumenBad}</div>
		</div>`

		return selectAdiciones
	}
	calcularPrecioTotalProducto(producto) {
		let rtaValorTotal = producto.price

		let acomulado = producto.modifique.reduce((acc, modifique) => {
			return acc + modifique.price
		}, 0)

		return rtaValorTotal + acomulado

	}
	renderisarResumenDireccion() {
		if (!this.direccion.cost) return ''
		const data = {
			nombre: 'Domicilio',
			mas: `${this.direccion.minDistance() + 15} minutos aprox`,
			precio: this.direccion.cost,
		}
		const rtaResumenDomicilio = this.crearTb(data)
		return rtaResumenDomicilio
	}
	renderisarResumenTotal() {
		let priceProductos = this.productos.reduce((acomulador, producto) => {
			const price = this.calcularPrecioTotalProducto(producto)
			return acomulador += price
		}, 0)

		const priceDomicilio = this.direccion.cost || 0

		const precioTotal = priceProductos + priceDomicilio

		const rta = this.crearTb({ nombre: `Total`, mas: ``, precio: precioTotal })
		return rta
	}
	crearTb({ nombre, mas, precio }) {
		const tr = `
			<tr class="tipografiaExtraBold">
				<td class=" "><small >${nombre}</small></td>
				<td><h6 class="my-0">${mas}</h6></td>
				<td><span class="text-success money">${precio}</span></td>
			</tr>
			`
		return tr
	}
	recogerDatos() {
		console.log(`hola estao son los datos`)
		const datos = {
			name: this.cliente.name,
			phone: this.cliente.phone,
			address: {
				address_complete: this.direccion.address_complete,
				coordinates: this.direccion._coordinates
			},
			note: this.datosExtra.nota,
			fee: this.datosExtra.metoDePago,
			order: this.productos,
		}
		console.log(datos);
		return datos


	}
	async mandarPedido() {
		const dataPedidos = this.recogerDatos()
		const options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dataPedidos)
		};

		iteruptorCargador(true)

		const response = await fetch(this.urlApi + 'dev', options)
		const data = await response.json()

		iteruptorCargador(false)

		if (response.status == 200) {
			console.log(`response`, data);

			localStorage.setItem("pedidoDomiburguer", JSON.stringify(data));

			// loader.style.display = "none";
			// iteruptorCargador(false)
			//deberiamos de madnar los parametros del costo , el id y el tiempo en la url
			window.location.href = "/html/gracias.html"

		} else {
			console.error('hubo un problema')
			//mandar mensage error
			alert(`Ha ocurido un erro
			porfavor revise el formulario y vuelva a intertarlo
			si ocurre de nuevo comuniquese a nuestro WhatsApp
			:)`)
		}
	}
}

class Producto {
	constructor({
		name,
		id,
		price,
		modifique = [],
		type,
		colorPrimary,
		colorSecondary
	}) {
		this.name = name
		this.id = id
		this.price = price
		this.modifique = modifique
		this.type = type
		this.idInter = makeid(5)
		this.colorPrimary = colorPrimary
		this.colorSecondary = colorSecondary

	}
	anadirModifique(modifique) {
		this.modifique.push(modifique)
	}
	retirarModifique({ name, index, id, idInter }) {
		let indexProducto
		if (name !== undefined) {
			indexProducto = this.modifique.findIndex(producto => producto.name == name)
		}
		if (id !== undefined) {
			indexProducto = this.modifique.findIndex(producto => producto.id == id)
		}
		if (index !== undefined) {
			indexProducto = index
		}
		if (idInter !== undefined) {
			indexProducto = this.modifique.findIndex(producto => producto.idInter == idInter)
		}
		if (indexProducto <= -1) throw `no se encontro ningun prouduc que cumple con las condiciones de busqueda`
		this.modifique.splice(indexProducto, 1)
	}
}

class Hamburguesa extends Producto {
	constructor(props) {
		super(props)
		this.name = 'Hamburguesa'
		this.id = `2`
		this.type = 'product'
		this.price = 16000
	}
}
class Combo extends Producto {
	constructor(props) {
		super(props)
		this.name = 'Combo'
		this.id = `1`
		this.type = 'product'
		this.price = 19500
	}
}

class ClienteForm {
	constructor({
		inputName,
		inputPhone,
	}) {
		this.inputName = inputName
		this.inputPhone = inputPhone
		this.name = ''
		this.phone = ''


		let nameElementById = document.getElementById(this.inputName)
		nameElementById.addEventListener('change', () => { this.actulisarValueName(nameElementById) })
		this.actulisarValueName(nameElementById)

		let phoneElementById = document.getElementById(this.inputPhone)
		phoneElementById.addEventListener('change', () => { this.actulisarValuePhone(phoneElementById) })
		this.actulisarValuePhone(phoneElementById)
	}
	actulisarValueName(e) {
		const nameOriginal = e.value
		//deberiamso de hacer un foramteo para que lleguen datos extranos
		this.name = nameOriginal
	}
	actulisarValuePhone(e) {
		const phoneOriginal = e.value
		//deberiamso de hacer un foramteo para que lleguen datos extranos
		this.phone = phoneOriginal
	}
}

//ponemos los input de la cantidad en 0
const inputProductoHamburguesa = document.getElementById(`cantidadHamburguesa`)
inputProductoHamburguesa.value = 0
const inputProductoCombo = document.getElementById(`cantidadCombo`)
inputProductoCombo.value = 0



class datosExtra {
	constructor({
		inputNota,
		inputMetodoDePago,
	}) {
		this.inputNota = inputNota
		this.inputMetodoDePago = inputMetodoDePago
		this.nota = ''
		this.metoDePago = ''


		let noteElementById = document.getElementById(this.inputNota)
		noteElementById.addEventListener('change', () => { this.actulisarValueNota(noteElementById) })
		this.actulisarValueNota(noteElementById)

		let metoDePagoElementById = document.getElementById(this.inputMetodoDePago)
		metoDePagoElementById.addEventListener('change', () => { this.actulisarValueMetoDePago(metoDePagoElementById) })
		this.actulisarValueMetoDePago(metoDePagoElementById)
	}
	actulisarValueNota(e) {
		const notaOriginal = e.value
		//deberiamso de hacer un foramteo para que lleguen datos extranos
		this.nota = notaOriginal
	}
	actulisarValueMetoDePago(e) {
		const metoDePagoOriginal = e.value
		//deberiamso de hacer un foramteo para que lleguen datos extranos
		this.metoDePago = metoDePagoOriginal
	}
}

const adiciones = [
	{
		"id": "9",
		"colorPrimary": "#98ba69",
		"price": 6500,
		"name": "Gaseosa litro 1 y 1/2",
		"description": "Gaseosa Coca-cola  1.500 L",
		"imagen": "https://cdn.fakercloud.com/avatars/BenouarradeM_128.jpg",
		"colorSecondary": "#d9a8ac",
		"dataCreate": {
			"_seconds": 1683598678,
			"_nanoseconds": 669000000
		},
		"dataUpdate": {
			"_seconds": 1683598678,
			"_nanoseconds": 669000000
		},
		"type": "Adicion"
	},
	{
		"id": "8",
		"colorPrimary": "#587196",
		"price": 500,
		"name": "Salsa roja",
		"description": "Salsa roja de adereso",
		"imagen": "https://cdn.fakercloud.com/avatars/BenouarradeM_128.jpg",
		"colorSecondary": "#1c7313",
		"dataCreate": {
			"_seconds": 1683598520,
			"_nanoseconds": 277000000
		},
		"dataUpdate": {
			"_seconds": 1683598520,
			"_nanoseconds": 277000000
		},
		"type": "Adicion"
	},
	{
		"id": "7",
		"colorPrimary": "#5bb89f",
		"price": 4000,
		"name": "Papas",
		"description": "Papas risadas a la francesa con paprica",
		"imagen": "https://cdn.fakercloud.com/avatars/BenouarradeM_128.jpg",
		"colorSecondary": "#ba705b",
		"dataCreate": {
			"_seconds": 1683598437,
			"_nanoseconds": 289000000
		},
		"dataUpdate": {
			"_seconds": 1683598437,
			"_nanoseconds": 289000000
		},
		"type": "Adicion"
	},
	{
		"id": "6",
		"colorPrimary": "#2c5c11",
		"price": 2000,
		"name": "Tocineta",
		"description": "tocineta de cerdo premium",
		"imagen": "https://cdn.fakercloud.com/avatars/BenouarradeM_128.jpg",
		"colorSecondary": "#228e95",
		"dataCreate": {
			"_seconds": 1683598322,
			"_nanoseconds": 250000000
		},
		"dataUpdate": {
			"_seconds": 1683598322,
			"_nanoseconds": 250000000
		},
		"type": "Adicion"
	}
]



let direccion
const cliente = new ClienteForm({ inputName: 'nombre', inputPhone: 'telefono', })
let notaMetodoDePago = new datosExtra({ inputNota: 'comentario', inputMetodoDePago: 'formaPago' })
let pedido = new Pedido({ direccion: direccion, cliente: cliente, datosExtra: notaMetodoDePago })
establecerAdicionesDePedido()

//el validador del formulario

// Fetch all the forms we want to apply custom Bootstrap validation styles to
const forms = document.querySelectorAll('.needs-validation')

// Loop over them and prevent submission
Array.from(forms).forEach(form => {
	//validamos el input de  los productos
	validarCantidadProducto()
	form.addEventListener('submit', async event => {
		if (!form.checkValidity()) {
			console.log(`stop propacion`)

			event.preventDefault()
			event.stopPropagation()
		} else {
			console.log(`seguimos con le subit`)

			event.preventDefault()
			event.stopPropagation()

			//mandamos el pedido
			await pedido.mandarPedido()

		}
		form.classList.add('was-validated')
	}, false)

	console.log(`termianos la validcion automatica,`)

})

const submitIdButton = document.getElementById(`submitIdButton`)
submitIdButton.addEventListener(`submit`, () => {
	console.log(`se preciono`)
})


async function establecerAdicionesDePedido() {
	const rta = await findAdiciones()
	pedido.adiciones = rta
}
async function findAdiciones() {
	try {
		const HOST_API = urlApi(true)//urlApi.js

		var HOST_CALIENTES = `${HOST_API}productos/filter?key=type&options===&value=Adicion`
		let url = HOST_CALIENTES

		var requestOptions = {
			method: 'GET',
		};
		const res = await fetch(url, requestOptions)
		const adiciones = await res.json()
		const rta = adiciones.body.map(e => e.data)
		return rta

	} catch (error) {
		console.log(error)
		throw error
	}
}


function mapaCargado() {

	direccion = new Adress({ map, idMap: `map` })
	direccion.setConfig()

	//establecemos la funcion que ocurre cuado se establesca una direccion
	const setDireccionCallback = () => {
		pedido.renderisarCambios()
	}
	direccion.initplacesAutocomplete('address', setDireccionCallback)
	pedido.direccion = direccion



}

function activarModalResumen() {

}

function anadirAdicionSelect(e, idInter) {
	//buscasmos cual es el indes del prouducinputProductoComboto que nos dieron para agragarle la adicion
	const productoIndex = pedido.productos.findIndex(producto => producto.idInter == idInter)
	//miramos cual es la adicion que agregaron 
	const idAdicion = e.value
	//creamos el nuenvo producto de adicion
	const productoAdicion = pedido.adiciones.filter(adicion => adicion.id == idAdicion)[0]
	const adicion = new Producto(productoAdicion)
	//agregamos la adicion
	pedido.productos[productoIndex].anadirModifique(adicion)
	//renderisamos otraves
	pedido.renderisarResumen()
}

function retirarAdicionSelect(idInterProducto, idInterAdicion) {
	//buscasmos cual es el indes del prouducto que nos dieron para retira la adicion la adicion
	const productoIndex = pedido.productos.findIndex(producto => producto.idInter == idInterProducto)
	//ejecutamos el metodo de retirar
	pedido.productos[productoIndex].retirarModifique({ idInter: idInterAdicion })
	pedido.renderisarResumen()
}

//en producto , es un objeto  de la clase proucto
function agregarPedido(producto, agregar = true) {

	if (agregar) {
		pedido.agregarProducto(producto)
	} else {
		console.log(`retirando un producto`)

		pedido.retirarProducto({ name: producto.name })
	}
	//validamo la cantidad de producto ,si es 0 lanamos el invalido en el formulario 
	validarCantidadProducto()
}

function validarCantidadProducto() {
	//quitama la invalidadion por si la tiene
	const inputProductoHamburguesa = document.getElementById(`cantidadHamburguesa`)
	const inputProductoCombo = document.getElementById(`cantidadCombo`)

	console.log("🚀 ~ file: formularioPedidosV2.js:736 ~ validarCantidadProducto ~ pedido.productos.length:", pedido.productos.length)

	if (pedido.productos.length <= 0) {
		inputProductoCombo.setCustomValidity('Por favor escoge un producto')
		inputProductoHamburguesa.setCustomValidity('Por favor escoge un producto')

	} else {
		inputProductoCombo.setCustomValidity('')
		inputProductoHamburguesa.setCustomValidity('')

	}
}


function iteruptorCargador(state = true) {
	var loaderOverlay = document.getElementById('loader-overlay');
	if (state == true) {
		loaderOverlay.style.display = 'flex';
	} else {
		loaderOverlay.style.display = 'none';
	}
}