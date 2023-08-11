document.addEventListener("DOMContentLoaded",() =>{	
	const grid = document.querySelector('.grid')
	const puntos = document.getElementById('puntuacion')

	// se define el ancho del tablero
	const width = 8
	// arreglo para los cuadros del tablero
	const cuadros = []
	// arreglo para las imagenes de los cuadros
	const colores = [
	'url(imagenes/rojo.png)',
	'url(imagenes/azul.png)',
	'url(imagenes/verde.png)',
	'url(imagenes/amarillo.png)',
	'url(imagenes/rosa.png)',
	'url(imagenes/morado.png)']

	// puntuacion del juego, se obtiene de las combinaciones realizadas
	let puntuacion = 0

	//crea el tablero del juego, este debe iniciar sin combinaciones
	function crearTablero(){
		for(let fila=0; fila < width; fila++) {
			for(let col = 0; col < width; col++){
				let cuadro = document.createElement('div');
				cuadro.setAttribute('draggable',true);
				cuadro.setAttribute('id',fila * width + col);

				// genera un color aleatorio para el cuadro, ademas verifica posiboles combinaciones
				do {					
					let colorAleatorio = Math.floor(Math.random() * colores.length);
					cuadro.style.backgroundImage = colores[colorAleatorio];
				} while (comprobarCombinacion(fila, col, cuadro.style.backgroundImage));

				grid.appendChild(cuadro);
				cuadros.push(cuadro);				
			}
		}
	}

	// comprueba que no exista una combinacion al principio del juego
	function comprobarCombinacion (fila, col, color) {
		const esValido = (index) => cuadros[index].style.backgroundImage === color;
    
    	const horizontalValido = (col >= 2) && esValido(fila * width + col - 2) && esValido(fila * width + col - 1);
    	const verticalValido = (fila >= 2) && esValido((fila - 2) * width + col) && esValido((fila - 1) * width + col);

    	return horizontalValido || verticalValido;	
	}
	
	// crea el tablero
	crearTablero()

	// datos del cuadro seleccionado
	let colorCuadroArrastrado
	let idCuadroArrastrado
	// datos del cuadro destino
	let colorCuadroReemplazado	
	let idCuadroReemplazado

	//mover las piezas del tablero
	cuadros.forEach(cuadro => {		
    cuadro.addEventListener('dragstart', dragStart);
    cuadro.addEventListener('dragend', dragEnd);
    cuadro.addEventListener('dragover', dragOver);
    cuadro.addEventListener('dragenter', dragEnter);
    cuadro.addEventListener('dragleave', dragLeave);
    cuadro.addEventListener('drop', dragDrop);
	})

	function dragStart(){
		colorCuadroArrastrado = this.style.backgroundImage		
		idCuadroArrastrado = parseInt(this.id)
		console.log(colorCuadroArrastrado)
		console.log(this.id,'dragstart')
	}

	function dragOver(e){
		e.preventDefault()
		console.log(this.id,'dragover')		
	}

	function dragEnter(e){
		e.preventDefault()
		console.log(this.id,'dragenter')
	}

	function dragLeave(){
		console.log(this.id,'dragleave')
	}

	function dragDrop(){	
		colorCuadroReemplazado = this.style.backgroundImage;
    	idCuadroReemplazado = parseInt(this.id);

    	// Verifica si el cuadro de destino es un movimiento válido
    	const movValido = [
        	idCuadroArrastrado - 1,   // mover hacia la izquierda
        	idCuadroArrastrado - width,   // mover hacia abajo
        	idCuadroArrastrado + 1,   // mover hacia la derecha
        	idCuadroArrastrado + width   // mover hacia arriba
    	];
    
    	const esValido = movValido.includes(idCuadroReemplazado);

    	if (esValido) {
       	 	// Realiza el intercambio de cuadros
        	const tempImage = cuadros[idCuadroArrastrado].style.backgroundImage;
        	cuadros[idCuadroArrastrado].style.backgroundImage = cuadros[idCuadroReemplazado].style.backgroundImage;
        	cuadros[idCuadroReemplazado].style.backgroundImage = tempImage;

        	// Realiza la comprobación de fila y columna de tres solo si es posible
        	const esColumnaValida = comprobarColumnaDeTres();
        	const esFilaValida = comprobarFilaDeTres();

        	// Si se forma una columna o fila válida, actualiza las variables
        	if (esColumnaValida || esFilaValida) {
            	colorCuadroArrastrado = colorCuadroReemplazado;
            	idCuadroArrastrado = idCuadroReemplazado;
        	} else {
            	// Si no se forma una columna o fila válida, deshace el cambio
            	cuadros[idCuadroArrastrado].style.backgroundImage = tempImage; // Restaura la imagen original del cuadro arrastrado
            	cuadros[idCuadroReemplazado].style.backgroundImage = colorCuadroReemplazado; // Restaura la imagen original del cuadro destino
        	}
    	}
	}

	function dragEnd(){	
		console.log(this.id,'dragend')
		// se definen los movimientos permitidos
		let movValido = [
		idCuadroArrastrado -1, // mover hacia la izquierda
		idCuadroArrastrado -width, // mover hacia abajo
		idCuadroArrastrado +1, // mover hacia la derecha
		idCuadroArrastrado +width // mover hacia arriba
		]

		let esValido = movValido.includes(idCuadroReemplazado)

		if (idCuadroReemplazado && esValido) {
			idCuadroReemplazado = null
		} else if (idCuadroReemplazado && !esValido) {
			cuadros[idCuadroReemplazado].style.backgroundImage = colorCuadroReemplazado
			cuadros[idCuadroArrastrado].style.backgroundImage = colorCuadroArrastrado
		} else cuadros[idCuadroArrastrado].style.backgroundImage = colorCuadroArrastrado		
	}

	// rellena los cuadros vacios despues de una combinacion
	function moverCuadros(){
		for (let col = 0; col < width; col++) {
			let cuadrosNoVacios = cuadros.filter(cuadro => cuadro.style.backgroundImage !== '')
			let cuadrosColumna = cuadrosNoVacios.filter(cuadro => parseInt(cuadro.id) % width === col)
			for (let fila = width - cuadrosColumna.length; fila >= 0; fila--) {				
				let cuadroVacio = cuadros.find(cuadro => cuadro.style.backgroundImage === '' && parseInt(cuadro.id) % width === col)
				if (cuadroVacio) {
					let colorAleatorio = Math.floor(Math.random() * colores.length)
					cuadroVacio.style.backgroundImage = colores[colorAleatorio]
					}
    			}
    		for (let i = 0; i < cuadrosColumna.length; i++) {
    			cuadros[(width - i - 1) * width + col].style.backgroundImage = cuadrosColumna[cuadrosColumna.length - i - 1].style.backgroundImage;
    		}
  		}
	}

	// Se comprueba la combinacion de colores
	// Fila de tres colores
	function comprobarFilaDeTres(){
		for (let fila = 0; fila < width; fila++) {
        	for (let col = 0; col < width - 2; col++) { // Optimizado el límite superior
            	const index = fila * width + col;
            	const colorElegido = cuadros[index].style.backgroundImage;
            	const esNulo = cuadros[index].style.backgroundImage === '';

            	if (!esNulo && cuadros[index + 1].style.backgroundImage === colorElegido && cuadros[index + 2].style.backgroundImage === colorElegido) {
                	puntuacion += 3;
                	puntos.innerHTML = puntuacion;
                	cuadros[index].style.backgroundImage = '';
                	cuadros[index + 1].style.backgroundImage = '';
                	cuadros[index + 2].style.backgroundImage = '';
                	return true;
            	}
        	}
    	}
    	return false; // Devolver false si no se encuentra una combinación
	}

	// columna de tres colores
	function comprobarColumnaDeTres(){			
		for (let col = 0; col < width; col++) {			
        	for (let fila = 0; fila < width - 2; fila++) {
            	const index = fila * width + col;
            	const colorElegido = cuadros[index].style.backgroundImage;
            	const esNulo = cuadros[index].style.backgroundImage === '';

            	if (!esNulo && cuadros[index + width].style.backgroundImage === colorElegido && cuadros[index + width * 2].style.backgroundImage === colorElegido) {            		
                	puntuacion += 3;
                	puntos.innerHTML = puntuacion;
                	cuadros[index].style.backgroundImage = '';
                	cuadros[index + width].style.backgroundImage = '';
                	cuadros[index + width * 2].style.backgroundImage = '';
                	return true;
            	}
        	}
    	}    	
    	return false; // Devolver false si no se encuentra una combinación
	}

	// intervalo de verificacion de combinaciones y relleno del tablero
	window.setInterval(function(){	
		comprobarFilaDeTres()
		comprobarColumnaDeTres()
		moverCuadros()		
	}, 100)
})