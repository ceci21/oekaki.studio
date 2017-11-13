var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var clearButton = document.getElementById('clear');
var colorPicker = document.getElementById('color-picker');
var sizeSelector = document.getElementById('size');
var layerSelector = document.getElementById('layer');

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
var canvasWidth = '500px';
var canvasHeight = '500px';
var canvasStyle = 'border:1px solid #000000;';

// Gets mouse position
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

// Event listeners for canvas/mouse actions
canvas.addEventListener('mousedown', function(evt) {
  draw = true;
  lastPosition = getMousePos(canvas, evt);
});

canvas.addEventListener('mouseup', function(evt) {
  draw = false;
  lineStarted = false;
});

canvas.addEventListener('mousemove', function(evt) {
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

}, false);

// Event listeners for canvas buttons
colorPicker.addEventListener('input', function(evt) {
  color = colorPicker.value;
});

clear.addEventListener('click', function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

sizeSelector.addEventListener('input', function(evt) {
  size = sizeSelector.value;
});

layerSelector.addEventListener('input', function(evt) {
  if (layerSelector.value > 3) {
    layerSelector.value = 3;
  } else if (layerSelector.value < 0){
    layerSelector.value = 0;
  }
  layer = layerSelector.value;
  console.log(layer);

  if (layerSelector.value > canvasLayers.length - 1) {
    var newCanvas = document.createElement('canvas');
    var newCanvasContext = newCanvas.getContext('2d');

    var newCanvasStyle = `
      position: fixed;
      top: 5px;
      left: 5px;
      border: 4px solid black;
      height: ${canvasHeight};
      width: ${canvasWidth};
    `;

    // Set attributes of new canvas.
    newCanvas.setAttribute('style', newCanvasStyle);

    document.body.append(newCanvas);
    canvasLayers.push(newCanvas);
  }

  canvas = canvasLayers[layer];
  ctx = canvasLayers[layer].getContext('2d');
});
