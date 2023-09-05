# Arceliuz

El proyecto de Arceliuz fue creado por la nececidad de [Domiburguer](http://domiburguer.com/home "Domiburguer") (un negocio de hamburguesa artesanales a domiclios ultraveloces)  que quiria un sistema personalisado en el que la eficiencia de recibir un pedido y entregarlo fuera automatisado y eficiente. 

## Objetivo principal
Como objetivo primordial, es hacer un sistema en el que los clentes puedan hacer un pedido con un solo click. que sea lo mas facil y rapido posible , quitando del medio el tener que establecer una conversacion con el cliete , por cuaquier medio de comunicion direccta (whatsap, messeger, facebook, instagram , google maps, etc) , esto se hara con una leadPage, en el que un formulario mandara al servidor de arceliuz la informacion del pedido, esta la procesara y mandara ya sea una alerta , notificacion o evento al trabajador de recpcion o plancha , para que esto proceda con le pedio, 

El formulario , para ser mas eficiente para le cliente, estara conectada con la api de [Google Maps Place Autocomplete ](https://developers.google.com/maps/documentation/javascript/place-autocomplete?hl=es-419#javascript "Google Maps Place Autocomplete ") con esto le podrremos poner un mapa de su direccio para que él pueda confiramar la ubiccion esacta.

Cuando se mande el pedido se enviara en foram de factura una pagina unica por medio de sms la numero que el cliente puso en el pedido. En la pagina esta la informaacon de factura y estaodo del pedido ( procesando, cocinando , en espera , despachado y finalisada),. y incluira la informacion del domiciliario 

Por el otro lado , el dervidor procesara la infprmacinon del pedido , con ayuda de una api , guardara al cliente en la base de datos con referencia al numero de celuta. con la direccion se buscara las corrdenadas con ayuda de google maps api para que se pueda ver la ubicion de envio en un mapa , mapa que usara los trabajadores de recepcion y domicilirario podran terner una referncia de la distancia y ubicacion. 

## Requeriminiento de la leadPage

- Recibir los datos del pedido: 
	 + nombre completo 
	 + Telefono 
	 + direccion
	 + producotos
	 + forma de pago :
	 	 -  efectivo : Devuleta de cunato 
	 	 - trasferncia : conectar la api de Nequi y bancolombia
	 + notas y comentarios 
- Tener los servicos de google maps para hacer una busqueda de la direccion de manera facill
- mostrar la direccion en un mapa pequeño 
- enviar todos los datos a la api 
- conectarse con el sevicio de cupones y referidos
- dar respusesta de la compra al estilo de factura
- calcular la distancia del envio para dar un pricio de domicilio en tiempo real
- conectar con los servicios de nequi y bancolombia para hacer cobros automaticos











