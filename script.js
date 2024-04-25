const grid = document.getElementById('grid');
const findPathBtn = document.getElementById('findPathBtn');
const resetBtn = document.getElementById('resetBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const showVisitedBtn = document.getElementById('showVisitedBtn');
const message = document.getElementById('message');

const numRows = 10;
const numCols = 10;
let startCell = null;
let endCell = null;
let cells = [];
let visitedCells = [];

// Crear la cuadrícula
function crearCuadricula() {
  for (let i = 0; i < numRows; i++) {
    cells[i] = [];
    for (let j = 0; j < numCols; j++) {
      const celda = document.createElement('div');
      celda.classList.add('celda');
      celda.addEventListener('click', () => manejarClickCelda(i, j));
      grid.appendChild(celda);
      cells[i][j] = celda;
    }
  }
}

// Manejar evento de clic en la celda
function manejarClickCelda(fila, columna) {
  const celda = cells[fila][columna];
  if (!startCell) {
    celda.classList.add('inicio');
    startCell = celda;
  } else if (!endCell && celda !== startCell) {
    celda.classList.add('fin');
    endCell = celda;
  } else if (celda !== startCell && celda !== endCell) {
    celda.classList.toggle('pared');
  }
}

// Encontrar el camino más corto usando el algoritmo de Dijkstra
function encontrarCamino() {
  if (!startCell || !endCell) {
    message.textContent = 'Por favor selecciona puntos de inicio y fin.';
    return;
  }

  const grafo = crearGrafo();
  const nodoInicio = obtenerNodoDesdeCelda(startCell);
  const nodoFin = obtenerNodoDesdeCelda(endCell);
  const distancias = {};
  const visitados = {};
  const anteriores = {};
  const noVisitados = new Set();

  // Inicializar distancias y conjunto de no visitados
  for (const nodo in grafo) {
    distancias[nodo] = Infinity;
    noVisitados.add(nodo);
  }
  distancias[nodoInicio] = 0;

  // Limpiar el arreglo de celdas visitadas
  visitedCells = [];

  while (noVisitados.size > 0) {
    // Encontrar el nodo no visitado con la menor distancia
    let nodoActual = null;
    let menorDistancia = Infinity;
    for (const nodo of noVisitados) {
      if (distancias[nodo] < menorDistancia) {
        nodoActual = nodo;
        menorDistancia = distancias[nodo];
      }
    }

    // Si el nodo actual es el nodo fin, hemos encontrado el camino más corto
    if (nodoActual === nodoFin) {
      break;
    }

    // Eliminar el nodo actual del conjunto de no visitados
    noVisitados.delete(nodoActual);

    // Resaltar la celda actual como visitada
    const [fila, columna] = nodoActual.split(',').map(Number);
    cells[fila][columna].classList.add('visitada');
    visitedCells.push(cells[fila][columna]);

    // Actualizar distancias de vecinos
    for (const vecino of grafo[nodoActual]) {
      const distancia = distancias[nodoActual] + 1;
      if (distancia < distancias[vecino]) {
        distancias[vecino] = distancia;
        anteriores[vecino] = nodoActual;
      }
    }
  }

  // Reconstruir el camino más corto
  const camino = [];
  let nodoActual = nodoFin;
  while (nodoActual !== nodoInicio) {
    camino.unshift(nodoActual);
    nodoActual = anteriores[nodoActual];
  }
  camino.unshift(nodoInicio);

  // Esperar un momento breve antes de resaltar el camino final
  setTimeout(() => {
    // Eliminar la clase 'visitada' de todas las celdas
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        cells[i][j].classList.remove('visitada');
      }
    }

    // Resaltar el camino final
    for (const nodo of camino) {
      const [fila, columna] = nodo.split(',').map(Number);
      cells[fila][columna].classList.add('camino');
    }

    // Mostrar los colores de los puntos de inicio y fin
    startCell.style.backgroundColor = '#7f7';
    endCell.style.backgroundColor = '#f77';
  }, 500);
}

// Crear una representación de grafo de la cuadrícula
function crearGrafo() {
  const grafo = {};
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (!cells[i][j].classList.contains('pared')) {
        const nodo = `${i},${j}`;
        grafo[nodo] = obtenerVecinos(i, j);
      }
    }
  }
  return grafo;
}

// Obtener los vecinos de una celda
function obtenerVecinos(fila, columna) {
  const vecinos = [];
  if (fila > 0 && !cells[fila - 1][columna].classList.contains('pared')) {
    vecinos.push(`${fila - 1},${columna}`);
  }
  if (fila < numRows - 1 && !cells[fila + 1][columna].classList.contains('pared')) {
    vecinos.push(`${fila + 1},${columna}`);
  }
  if (columna > 0 && !cells[fila][columna - 1].classList.contains('pared')) {
    vecinos.push(`${fila},${columna - 1}`);
  }
  if (columna < numCols - 1 && !cells[fila][columna + 1].classList.contains('pared')) {
    vecinos.push(`${fila},${columna + 1}`);
  }
  return vecinos;
}

// Obtener la representación de nodo de una celda
function obtenerNodoDesdeCelda(celda) {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (cells[i][j] === celda) {
        return `${i},${j}`;
      }
    }
  }
}

// Reiniciar la cuadrícula
function reiniciarCuadricula() {
  startCell = null;
  endCell = null;
  visitedCells = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      cells[i][j].classList.remove('inicio', 'fin', 'pared', 'visitada', 'camino');
    }
  }
  message.textContent = '';
}

// Aleatorizar paredes
function aleatorizarParedes() {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (cells[i][j] !== startCell && cells[i][j] !== endCell) {
        cells[i][j].classList.toggle('pared', Math.random() < 0.3);
      }
    }
  }
}

// Mostrar celdas visitadas
function mostrarCeldasVisitadas() {
  for (const celda of visitedCells) {
    celda.classList.add('visitada');
  }
}

// Escuchadores de eventos
findPathBtn.addEventListener('click', encontrarCamino);
resetBtn.addEventListener('click', reiniciarCuadricula);
randomizeBtn.addEventListener('click', aleatorizarParedes);
showVisitedBtn.addEventListener('click', mostrarCeldasVisitadas);

// Inicializar la cuadrícula
crearCuadricula();
