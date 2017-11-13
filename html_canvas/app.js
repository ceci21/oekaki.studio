var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var clearButton = document.getElementById('clear');
var colorPicker = document.getElementById('color-picker');
var sizeSelector = document.getElementById('size');
var layerSelector = document.getElementById('layer');
var undoButton = document.getElementById('undo');
var redoButton = document.getElementById('redo');

var draw = false;
var lineStarted = false;
var lastPosition = {
  x: 0,
  y: 0
};

var color = "#000000";
var size = 1;
var layer = 0;
var canvasLayers = [canvas];
var canvasWidth = '1000px';
var canvasHeight = '500px';
var canvasStyle = 'border:1px solid #000000;';
var canvasHistory = [[]];

// Socket io
var socket = io.connect('http://127.0.0.1:3000/');

socket.on('data', function(data) {
  canvasHistory = data.history;
  reloadCanvas();
});

var sendImageData = function() {
  socket.emit('drawImage', { history: canvasHistory });
}

// Various canvas events.
var getMousePos = function(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

var mouseDown = function(evt) {
  draw = true;
  lastPosition = getMousePos(canvas, evt);
};

var mouseUp = function(evt) {
  draw = false;
  lineStarted = false;
  canvasHistory[layer].push(canvas.toDataURL());
  sendImageData();
};

var mouseMove = function(evt) {
  if (lineStarted === false) {
    lastPosition = getMousePos(canvas, evt);
    lineStarted = true;
  }
  if (draw === true) {
    var mousePos = getMousePos(canvas, evt);
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();

    lastPosition.x = mousePos.x;
    lastPosition.y = mousePos.y;
  }

}

var pickColor = function() {
  color = colorPicker.value;
};

var selectSize = function(evt) {
  size = sizeSelector.value;
};

var clearCanvas = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvasHistory[layer] = [];
};

var undoAction = function() {
  if (canvasHistory[layer].length === 0) {
    console.log('No history to go back to!');
  } else if (canvasHistory[layer].length === 1) {
    clearCanvas();
    canvasHistory[layer] = [];
  } else {
    clearCanvas();
    var img = new Image();
    img.onload = function() {
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    }
    img.src = canvasHistory[layer][canvasHistory[layer].length - 2];
    canvasHistory[layer] = canvasHistory[layer].slice(0, canvasHistory[layer].length - 1);
  }
}

var redoAction = function() {

}

var reloadCanvas = function() {
  var img = new Image();
  img.onload = function() {
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
  }
  img.src = canvasHistory[layer][canvasHistory[layer].length - 1];
}

var selectLayer = function(evt) {

  // Layer range can only be between 0 and 3.
  if (layerSelector.value > 0) {
    layerSelector.value = 0;
  } else if (layerSelector.value < 0){
    layerSelector.value = 0;
  }

  // Set layer to be the value of the current layer.
  layer = layerSelector.value;

  if (layerSelector.value > canvasLayers.length - 1) {
    var newCanvas = document.createElement('canvas');

    var newCanvasStyle = `
      position: fixed;
      top: 5px;
      left: 5px;
      border: 4px solid black;
      z-index: 1000;
    `;

    var canvasId = 'canvas-' + layer;

    // Set attributes of new canvas.
    newCanvas.setAttribute('style', newCanvasStyle);
    newCanvas.setAttribute('id', canvasId);
    newCanvas.setAttribute('height', canvasHeight);
    newCanvas.setAttribute('width', canvasWidth);
    document.body.append(newCanvas);
    canvasLayers.push(newCanvas);

    canvasHistory.push([]);
  }

  canvas = canvasLayers[layer];
  ctx = canvasLayers[layer].getContext('2d');

  removeEventListeners();
  createEventListeners();
}

// Create and remove event listeners.
var createEventListeners = function() {
  // Event listeners for canvas/mouse actions
  canvas.addEventListener('mousedown', mouseDown);

  canvas.addEventListener('mouseup', mouseUp);

  canvas.addEventListener('mousemove', mouseMove);

  colorPicker.addEventListener('input', pickColor);

  clear.addEventListener('click', clearCanvas);

  undo.addEventListener('click', undoAction);

  redo.addEventListener('click', redoAction);

  sizeSelector.addEventListener('input', selectSize);

  layerSelector.addEventListener('input', selectLayer);
}

var removeEventListeners = function() {
  // Event listeners for canvas/mouse actions
  canvas.removeEventListener('mousedown', mouseDown);

  canvas.removeEventListener('mouseup', mouseUp);

  canvas.removeEventListener('mousemove', mouseMove);

  colorPicker.removeEventListener('input', pickColor);

  clear.removeEventListener('click', clearCanvas);

  sizeSelector.removeEventListener('input', selectSize);

  layerSelector.removeEventListener('input', selectLayer);
}

createEventListeners();
