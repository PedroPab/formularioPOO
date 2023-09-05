function urlApi(dev = null) {
	//cambiamos la url de peticiones
	var direccion = window.location.hostname;
	var puerto = window.location.port;
	var protocolo = window.location.protocol;

	let HOST_API = `${protocolo}//${direccion}:${puerto}/api/`
	// if (window.origin.includes('http://127.0.0.1') ||
	console.log("🚀 ~ file: urlApi.js:10 ~ urlApi ~ HOST_API:", HOST_API)
	// 	this.origin.includes('127.0.0.1') ||
	// 	this.origin.includes('localhost')
	// ) {
	// 	HOST_API = `http://localhost:8087/api/`
	// }
	// else if (//por se esta en mi celuar en local
	// 	this.origin.includes('192.168.1.14')
	// ) {
	// 	HOST_API = `http://192.168.1.14:8087/api/`
	// }
	if (dev == true) return `https://domiburguer.ue.r.appspot.com
	/api/`
		return HOST_API
}

function urlHost() {
	//cambiamos la url de peticiones
	var direccion = window.location.hostname;
	var puerto = window.location.port;
	var protocolo = window.location.protocol;

	let HOST_API = `${protocolo}//${direccion}:${puerto}/`
	// if (window.origin.includes('http://127.0.0.1') ||
	// 	this.origin.includes('127.0.0.1') ||
	// 	this.origin.includes('localhost')
	// ) {
	// 	HOST_API = `http://localhost:8087/api/`
	// }
	// else if (//por se esta en mi celuar en local
	// 	this.origin.includes('192.168.1.14')
	// ) {
	// 	HOST_API = `http://192.168.1.14:8087/api/`
	// }
	return HOST_API
}