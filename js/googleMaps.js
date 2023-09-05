// let map = null//creamos el objeto mapa para tenerlo en todo el codigo

async function initMap() {
	console.log("inicianod el mapa")

	let center = { lat: 6.2999347, lng: -75.5764272 }
	const elementMap = document.getElementById('map')

	//si no hay ningun elemento con el id map no hacemos nada
	if (elementMap == null) {
		console.log("no se pudo iniciar el mapa porque no hay un elementeo con el id map ")
		return
	}

	map = new google.maps.Map(elementMap, {
		center: center,
		zoom: 16
	});
	console.log("mapa cargado correctamente")
	if (window.mapaCargado == undefined) return map

	window.map = map

	mapaCargado()

	return map
}