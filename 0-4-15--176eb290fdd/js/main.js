(function () {
"use strict";


/**
*
* KlekiProjectObj {
*     width: int,
*     height: int,
*     layers: {
*        name: string,
*        opacity: float (0 - 1),
*        mixModeStr: string,
*        image: image object                <--------- image already loaded!
*     }[]
* }
*
* @param p_w int - width of UI
* @param p_h int - height of UI
* @param p_klekiProjectObj KlekiProjectObj|null - project you want kleki to start with. null -> empty canvas
* @returns {HTMLDivElement}
* @constructor
*/
function PCWeb(p_w, p_h, p_klekiProjectObj) {


var klekiMaxCanvasSize = Math.min(4096, Math.max(2048, Math.max(window.screen.width, window.screen.height)));
let collapseThreshold = 820;
let uiState = localStorage.getItem('uiState') ? localStorage.getItem('uiState') : 'right';
var e = [];


var pEl = {
fillLayer: function (ctx) {
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, pcCanvas.width, pcCanvas.height);
}
};
var div = document.createElement("div");
div.className = 'g-root';
var width = Math.max(0, p_w);
var height = Math.max(0, p_h);
var toolwidth = 271;
var exportPNG = true;
var exportType = 'png';
var pcCanvas = new BV.PcCanvas(
p_klekiProjectObj ? {
projectObj: p_klekiProjectObj
} : {
width: Math.min(klekiMaxCanvasSize, window.innerWidth < collapseThreshold ? width : width - toolwidth),
height: Math.min(klekiMaxCanvasSize, height)
});
pcCanvas.setLogger(BV.pcLog);
var initState = {};

if (p_klekiProjectObj) {
setTimeout(function() {
output.out('Restored from Browser Storage');
}, 100);
}

function translateSmoothing(s) {
if(s == 1) {
return 1 - 0.5;
}
if(s == 2) {
return 1 - 0.16;
}
if(s == 3) {
return 1 - 0.035;
}
if(s == 4) {
return 1 - 0.0175;
}
if(s == 5) {
return 1 - 0.00875;
}
return s;
}

function isUploadAllowed() {
return 0 < BV.pcLog.getState();
}

let isFirstImage = true;
function isFirstUntouchedImage() {
return isFirstImage && 0 === BV.pcLog.getState();
}

if(p_klekiProjectObj) {
p_klekiProjectObj = null;
} else {
BV.pcLog.pause();
pcCanvas.addLayer();
pEl.fillLayer(pcCanvas.getLayerContext(0));
BV.pcLog.pause(false);
}
initState = {
canvas: new BV.PcCanvas({copy: pcCanvas}),
focus: pcCanvas.getLayerCount() - 1
};

initState.initBrushes = function () {
initState.brushes = {};
for (var b in BV.BrushLib) {
if (BV.BrushLib.hasOwnProperty(b)) {
initState.brushes[b] = new BV.BrushLib[b]();
if (initState.canvas) {
initState.brushes[b].setContext(initState.canvas.getLayerContext(initState.focus));
}
}
}
if (initState.canvas) {
initState.brushes.smoothBrush.setRequestCanvas(function () {
return initState.canvas;
});
}
};
initState.initBrushes();


var currentColor = new BV.RGB(0, 0, 0);
var currentBrush, currentBrushId;
var lastNonEraserBrushId = 0;
var currentLayerCtx = pcCanvas.getLayerContext(pcCanvas.getLayerCount() - 1);
var currentMode = {
onInput: function () {
}
};

function sizeWatcher(val) {
brushSettingService.emitSize(val);
if (pcCanvasWorkspace) {
pcCanvasWorkspace.setCursorSize(val * 2);
}
}

/**
* Central place to update brush settings, and to subscribe to changes.
*
* subscribers receive in this format:
* BrushSettingEvent
* {
*     type: 'color',
*     value: rgb obj
* } | {
*     type: 'size',
*     value: number
* } | {
*     type: 'opacity',
*     value: number 0-1
* } | {
*     type: 'sliderConfig',
*     value: {
*         sizeSlider: {min: number, max: number, curve: []}
*         opacitySlider: {min: number, max: number, curve: []}
*     }
* }
*
* interface in the return.
*
* @type obj
*/
let brushSettingService = (function() {
let subscriberArr = [];

/**
* sends obj to all subscribers. except the skipSubscriber
* @param obj
* @param skipSubscriberr - optional - subscriber function not to emit to
*/
function emit(obj, skipSubscriber) {
for (let i = 0; i < subscriberArr.length; i++) {
if (subscriberArr[i] === skipSubscriber) {
continue;
}
subscriberArr[i](obj);
}
}

function emitColor(rgbObj, skipSubscriber) {
emit({
type: 'color',
value: rgbObj
}, skipSubscriber);
}

function emitSize(size, skipSubscriber) {
emit({
type: 'size',
value: size
}, skipSubscriber);
}

/**
* @param opacity 0-1
* @param skipSubscriber
*/
function emitOpacity(opacity, skipSubscriber) {
emit({
type: 'opacity',
value: opacity
}, skipSubscriber);
}

/**
* @param config
* @param skipSubscriber
*/
function emitSliderConfig(config, skipSubscriber) {
emit({
type: 'sliderConfig',
value: config
}, skipSubscriber);
}


return {
emitColor: emitColor,
emitSize: emitSize,
emitOpacity: emitOpacity,
emitSliderConfig: emitSliderConfig,
/**
* set current brush color
* @param rgbObj
* @param skipSubscriber
*/
setColor: function(rgbObj, skipSubscriber) {
pcColorSlider.setColor(rgbObj);
currentBrush.setColor(rgbObj);
currentColor = rgbObj;
emitColor(rgbObj, skipSubscriber);
},

/**
* set current brush size
* @param size
* @param skipSubscriber
*/
setSize: function(size, skipSubscriber) {
currentBrush.setSize(size);
pcCanvasWorkspace.setCursorSize(size * 2);
},

/**
* set current opacity
* @param opacity 0-1
* @param skipSubscriber
*/
setOpacity: function(opacity, skipSubscriber) {
currentBrush.setOpacity(opacity);
},

/**
* get current brush color
* @returns rgbObj
*/
getColor: function() {
return pcColorSlider.getColor();
},
/**
* @returns number
*/
getSize: function() {
return brushUiObj[currentBrushId].getSize();
},
/**
* @returns number 0-1
*/
getOpacity: function() {
return brushUiObj[currentBrushId].getOpacity();
},
/**
* @returns config
*/
getSliderConfig: function() {
return {
sizeSlider: BV.BrushLibUI[currentBrushId].sizeSlider,
opacitySlider: BV.BrushLibUI[currentBrushId].opacitySlider
};
},
/**
* subscribe to changes
* @param func(BrushSettingEvent) - this function gets called on change
*/
subscribe: function(func) {
subscriberArr.push(func);
},
unsubscribe: function(func) {
for(let i = 0; i < subscriberArr.length; i++) {
if(func === subscriberArr[i]) {
subscriberArr.splice(i, 1);
i--;
}
}
}
};
})();

let lineSmoothing = new BV.EventChain.LineSmoothing({
smoothing: translateSmoothing(1)
});
let lineSanitizer = new BV.EventChain.LineSanitizer({});

let drawEventChain = new BV.EventChain.EventChain({
chainArr: [
lineSanitizer,
lineSmoothing
]
});

drawEventChain.setChainOut(function(event) {
if(event.type === 'down') {
toolspace.style.pointerEvents = 'none';
currentBrush.startLine(event.x, event.y, event.pressure);

pcCanvasWorkspace.requestFrame();
}
if(event.type === 'move') {
currentBrush.goLine(event.x, event.y, event.pressure, false, event.isCoalesced)

pcCanvasWorkspace.setLastDrawEvent(event.x, event.y, event.pressure);
pcCanvasWorkspace.requestFrame();
}
if(event.type === 'up') {
toolspace.style.pointerEvents = '';
currentBrush.endLine();

pcCanvasWorkspace.requestFrame();
}
if(event.type === 'line') {

currentBrush.getBrush().drawLineSegment(event.x0, event.y0, event.x1, event.y1);
pcCanvasWorkspace.requestFrame();
}
});



let textToolSettings = {
size: 20,
align: 'left',
isBold: false,
isItalic: false,
font: 'sans-serif',
opacity: 1
};

var pcCanvasWorkspace = new BV.PcCanvasWorkspace({
pcCanvas: pcCanvas,
width: Math.max(0, width - toolwidth),
height: height,
onDraw: drawEventChain.chainIn,
onFill: function(canvasX, canvasY) {
let layerIndex = pcCanvas.getLayerIndex(currentLayerCtx.canvas);
pcCanvas.floodFill(layerIndex, canvasX, canvasY, pcColorSlider.getColor(), fillUi.getOpacity(), fillUi.getTolerance(), fillUi.getSample(), fillUi.getGrow(), fillUi.getContiguous());
pcCanvasWorkspace.requestFrame();
},
onText: function(canvasX, canvasY, angleRad) {
if (KLEKI.isInDialog > 0) {
return;
}

BV.textToolDialog({
pcCanvas: pcCanvas,
layerIndex: pcCanvas.getLayerIndex(currentLayerCtx.canvas),
x: canvasX,
y: canvasY,
angleRad: angleRad,
color: pcColorSlider.getColor(),
secondaryColor: pcColorSlider.getSecondaryRGB(),
size: textToolSettings.size,
align: textToolSettings.align,
isBold: textToolSettings.isBold,
isItalic: textToolSettings.isItalic,
font: textToolSettings.font,
opacity: textToolSettings.opacity,
onConfirm: function(val) {

let colorRGBA = val.color;
colorRGBA.a = val.opacity;

textToolSettings.size = val.size;
textToolSettings.align = val.align;
textToolSettings.isBold = val.isBold;
textToolSettings.isItalic = val.isItalic;
textToolSettings.font = val.font;
textToolSettings.opacity = val.opacity;

let layerIndex = pcCanvas.getLayerIndex(currentLayerCtx.canvas);
pcCanvas.text(layerIndex, {
textStr: val.textStr,
x: val.x,
y: val.y,
angleRad: angleRad,
color: BV.ColorConverter.toRgbaStr(colorRGBA),
size: val.size,
align: val.align,
isBold: val.isBold,
isItalic: val.isItalic,
font: val.font
});
pcCanvasWorkspace.requestFrame();
}
});

},
onShape: function(typeStr, canvasX, canvasY, angleRad) {
if (typeStr === 'down') {
shapeTool.onDown(canvasX, canvasY, angleRad);
}
if (typeStr === 'move') {
shapeTool.onMove(canvasX, canvasY);
}
if (typeStr === 'up') {
shapeTool.onUp(canvasX, canvasY);
}
},
onPick: function(rgbObj, isDragDone) {
brushSettingService.setColor(rgbObj);
if(isDragDone) {
pcColorSlider.pickingDone();
pcCanvasWorkspace.setMode(toolspaceToolRow.getActive());
}
},
onViewChange: function(viewChangeObj) {

if(viewChangeObj.changed.includes('scale')) {
let outObj = {
type: 'transform',
scale: viewChangeObj.scale,
angleDeg: viewChangeObj.angle * 180 / Math.PI
};
output.out(outObj);
}

toolspaceToolRow.setEnableZoomIn(viewChangeObj.scale !== pcCanvasWorkspace.getMaxScale());
toolspaceToolRow.setEnableZoomOut(viewChangeObj.scale !== pcCanvasWorkspace.getMinScale());

handUi.update(viewChangeObj.scale, viewChangeObj.angle * 180 / Math.PI);
},
onUndo: function() {
if(BV.pcLog.canUndo()) {
output.out('Undo', true);
execUndo();
}
},
onRedo: function() {
if(BV.pcLog.canRedo()) {
output.out('Redo', true);
execRedo();
}
}
});
var keyListener = new BV.KeyListener({
onDown: function(keyStr, event, comboStr) {
if (KLEKI.isInDialog > 0) {
return;
}
if(document.activeElement && document.activeElement.tagName === 'INPUT') {
return;
}

let isDrawing = lineSanitizer.getIsDrawing() || pcCanvasWorkspace.getIsDrawing();
if (isDrawing) {
return;
}

if(comboStr === 'plus') {
pcCanvasWorkspace.zoomByStep(keyListener.isPressed('shift') ? 1/8 : 1/2);
}
if(comboStr === 'minus') {
pcCanvasWorkspace.zoomByStep(keyListener.isPressed('shift') ? -1/8 : -1/2);
}
if(comboStr === 'home') {
pcCanvasWorkspace.fitView();
}
if(comboStr === 'end') {
pcCanvasWorkspace.resetView(true);
}
if (['ctrl+z', 'cmd+z'].includes(comboStr)) {
event.preventDefault();
event.returnValue = false;
execUndo();
}
if (['ctrl+y', 'cmd+y'].includes(comboStr)) {
event.preventDefault();
event.returnValue = false;
execRedo();
}
if (['ctrl+s', 'cmd+s'].includes(comboStr)) {
event.preventDefault();
event.returnValue = false;
saveImageToComputer();
}
if (['ctrl+shift+s', 'cmd+shift+s'].includes(comboStr)) {
event.preventDefault();
event.returnValue = false;
saveToBrowserStorage();
}
if (['ctrl+c', 'cmd+c'].includes(comboStr)) {
event.preventDefault();
event.returnValue = false;
copyToClipboard();
}
if (['ctrl+a', 'cmd+a'].includes(comboStr)) {
event.preventDefault();
event.returnValue = false;
}


if(keyListener.comboOnlyContains(['left', 'right', 'up', 'down'])) {
if (keyStr === 'left') {
pcCanvasWorkspace.translateView(1, 0);
}
if (keyStr === 'right') {
pcCanvasWorkspace.translateView(-1, 0);
}
if (keyStr === 'up') {
pcCanvasWorkspace.translateView(0, 1);
}
if (keyStr === 'down') {
pcCanvasWorkspace.translateView(0, -1);
}
}


if(['r+left','r+right'].includes(comboStr)) {
if (keyStr === 'left') {
pcCanvasWorkspace.setAngle(-15, true);
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
}
if (keyStr === 'right') {
pcCanvasWorkspace.setAngle(15, true);
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
}
}
if(['r+up'].includes(comboStr)) {
pcCanvasWorkspace.setAngle(0);
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
}


if (comboStr === 'sqbr_open') {
currentBrush.decreaseSize(0.03 / pcCanvasWorkspace.getScale());
}
if (comboStr === 'sqbr_close') {
currentBrush.increaseSize(0.03 / pcCanvasWorkspace.getScale());
}
if (comboStr === 'enter') {
pcCanvas.layerFill(pcCanvas.getLayerIndex(currentLayerCtx.canvas), pcColorSlider.getColor());
}
if (['delete', 'backspace'].includes(comboStr)) {
var layerIndex = pcCanvas.getLayerIndex(currentLayerCtx.canvas);
if (layerIndex === 0 && !brushUiObj.eraser.getIsTransparentBg()) {
pcCanvas.layerFill(layerIndex, {r: 255, g: 255, b: 255}, 'source-in');
} else {
pcCanvas.clearLayer(layerIndex);
}
}
if (comboStr === 'e') {
event.preventDefault();
pcCanvasWorkspace.setMode('draw');
toolspaceToolRow.setActive('draw');
mainTabRow.open('draw');
updateMainTabVisibility();
brushTabRow.open('eraser');
}
if (comboStr === 'b') {
event.preventDefault();
pcCanvasWorkspace.setMode('draw');
toolspaceToolRow.setActive('draw');
mainTabRow.open('draw');
updateMainTabVisibility();
brushTabRow.open(lastNonEraserBrushId);
}
if (comboStr === 'g') {
event.preventDefault();
pcCanvasWorkspace.setMode('fill');
toolspaceToolRow.setActive('fill');
mainTabRow.open('fill');
updateMainTabVisibility();
}
if (comboStr === 't') {
event.preventDefault();
pcCanvasWorkspace.setMode('text');
toolspaceToolRow.setActive('text');
mainTabRow.open('text');
updateMainTabVisibility();
}
if (comboStr === 'u') {
event.preventDefault();
pcCanvasWorkspace.setMode('shape');
toolspaceToolRow.setActive('shape');
mainTabRow.open('shape');
updateMainTabVisibility();
}
if (comboStr === 'x') {
event.preventDefault();
pcColorSlider.swapColors();
}


},
onUp: function(keyStr) {
var endWheeling = false;
if(keyStr === 'alt') {
e.returnValue = false;
}
}
});



function execUndo() {
if (!BV.pcLog.canUndo()) {
return;
}
var startTime = performance.now();
var actions = BV.pcLog.undo();
BV.pcLog.pause();
var oldSize = {w: pcCanvas.getWidth(), h: pcCanvas.getHeight()};
pcCanvas.copy(initState.canvas);
var layerIndex = initState.focus;
currentLayerCtx = pcCanvas.getLayerContext(layerIndex);
var brushes = {};
for (var b in BV.BrushLib) {
if (BV.BrushLib.hasOwnProperty(b)) {
brushes[b] = new BV.BrushLib[b]();
brushes[b].setContext(currentLayerCtx);
brushes[b].setDebug('is_undo');
}
}
brushes.sketchy.setSeed(initState.brushes.sketchy.getSeed());
brushes.smoothBrush.setRequestCanvas(function () {
return pcCanvas;
});
for (var i = 0; i < actions.length; i++) {
(function (i) {
if (actions[i].tool[0] === "brush") {
var b = brushes[actions[i].tool[1]];
if (actions[i].actions) {
for (var e = 0; e < actions[i].actions.length; e++) {
var p = actions[i].actions[e].params;
b[actions[i].actions[e].action].apply(b, p);
}
} else {
var p = actions[i].params;
b[actions[i].action].apply(b, p);
}
} else if (actions[i].tool[0] === "canvas") {
var p = actions[i].params;
var id = pcCanvas[actions[i].action].apply(pcCanvas, p);
if (typeof id === typeof 123) {
layerIndex = id;
currentLayerCtx = pcCanvas.getLayerContext(layerIndex);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(currentLayerCtx);
}
}
}
} else if (actions[i].tool[0] === "filter") {
var p = [{
context: currentLayerCtx,
canvas: pcCanvas,
input: actions[i].params[0].input,
logger: {
add: function () {
}, pause: function () {
}
}
}];
BV.FilterLib[actions[i].tool[1]][actions[i].action].apply(null, p);
} else if (actions[i].tool[0] === "misc" && actions[i].action === "focusLayer") {
layerIndex = actions[i].params[0];
currentLayerCtx = pcCanvas.getLayerContext(actions[i].params[0]);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(currentLayerCtx);
}
}
} else if (actions[i].tool[0] === "misc" && actions[i].action === "importImage") {
var id = pcCanvas.addLayer();
if (typeof id === typeof 123) {
layerIndex = id;
currentLayerCtx = pcCanvas.getLayerContext(layerIndex);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(currentLayerCtx);
}
}
}
currentLayerCtx.drawImage(actions[i].params[0], 0, 0);
}
})(i);
}
if (oldSize.w !== pcCanvas.getWidth() || oldSize.h !== pcCanvas.getHeight()) {
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
}
layerManager.update(layerIndex);
layerPreview.setLayer(pcCanvas.getLayer(layerIndex));
brushUiObj.sketchy.setSeed(brushes.sketchy.getSeed());
currentBrush.setContext(currentLayerCtx);
pcCanvasWorkspace.setLastDrawEvent(null);

BV.pcLog.pause(false);
}

function execRedo() {
if (!BV.pcLog.canRedo()) {
return;
}
var actions = BV.pcLog.redo();
BV.pcLog.pause();
var oldSize = {w: pcCanvas.getWidth(), h: pcCanvas.getHeight()};
var layerIndex;
var brushes = {};
for (var b in BV.BrushLib) {
if (BV.BrushLib.hasOwnProperty(b)) {
brushes[b] = new BV.BrushLib[b]();
brushes[b].setContext(currentLayerCtx);
}
}
brushes.smoothBrush.setRequestCanvas(function () {
return pcCanvas;
});
brushes.sketchy.setSeed(brushUiObj.sketchy.getSeed());
for (var i = 0; i < actions.length; i++) {
(function (i) {
if (actions[i].tool[0] === "brush") {
var b = brushes[actions[i].tool[1]];
if (actions[i].actions) {
for (var e = 0; e < actions[i].actions.length; e++) {
var p = actions[i].actions[e].params;
b[actions[i].actions[e].action].apply(b, p);
}
} else {
var p = actions[i].params;
b[actions[i].action].apply(b, p);
}
} else if (actions[i].tool[0] === "canvas") {
var p = actions[i].params;
var id = pcCanvas[actions[i].action].apply(pcCanvas, p);
if (typeof id === typeof 123) {
layerIndex = id;
currentLayerCtx = pcCanvas.getLayerContext(layerIndex);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(currentLayerCtx);
}
}
}
} else if (actions[i].tool[0] === "filter") {
var p = [{
context: currentLayerCtx,
canvas: pcCanvas,
input: actions[i].params[0].input,
logger: {
add: function () {
}, pause: function () {
}
}
}];
BV.FilterLib[actions[i].tool[1]][actions[i].action].apply(null, p);
} else if (actions[i].tool[0] === "misc" && actions[i].action === "focusLayer") {
layerIndex = actions[i].params[0];
currentLayerCtx = pcCanvas.getLayerContext(actions[i].params[0]);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(currentLayerCtx);
}
}
} else if (actions[i].tool[0] === "misc" && actions[i].action === "importImage") {
var id = pcCanvas.addLayer();
if (typeof id === typeof 123) {
layerIndex = id;
currentLayerCtx = pcCanvas.getLayerContext(layerIndex);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(currentLayerCtx);
}
}
}
currentLayerCtx.drawImage(actions[i].params[0], 0, 0);
}
})(i);
}

if (oldSize.w !== pcCanvas.getWidth() || oldSize.h !== pcCanvas.getHeight()) {
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
}
var currentLayerIndex = pcCanvas.getLayerIndex(currentLayerCtx.canvas);
layerManager.update(currentLayerIndex);
layerPreview.setLayer(pcCanvas.getLayer(currentLayerIndex));
brushUiObj.sketchy.setSeed(brushes.sketchy.getSeed());
currentBrush.setContext(currentLayerCtx);
pcCanvasWorkspace.setLastDrawEvent(null);
BV.pcLog.pause(false);
}

/**
*
* @param importedImage - convertedPsd | {type: 'image', width: number, height: number, canvas: image | canvas}
* @param optionStr? - 'default' | 'layer' | 'image'
*/
function importFinishedLoading(importedImage, optionStr) {

if (!importedImage || isNaN(importedImage.width) || isNaN(importedImage.height) || importedImage.width <= 0 || importedImage.height <= 0) {
BV.popup({
target: pcWeb,
type: "error",
message: "Couldn't load image. File might be corrupted.",
buttons: ["Ok"],
callback: function (result) {
}
});
return;
}

function getResizedDimensions(width, height) {
var w = parseInt(width);
var h = parseInt(height);
if (w > klekiMaxCanvasSize) {
h = klekiMaxCanvasSize / w * h;
w = klekiMaxCanvasSize;
}
if (h > klekiMaxCanvasSize) {
w = klekiMaxCanvasSize / h * w;
h = klekiMaxCanvasSize;
}
w = parseInt(w);
h = parseInt(h);
return {
width: w,
height: h
}
}

function importAsImage(canvas) {
let resizedDimensions = getResizedDimensions(canvas.width, canvas.height);


let tempCanvas = BV.createCanvas(canvas.width, canvas.height);
let tempCanvasCtx = tempCanvas.getContext('2d');
tempCanvasCtx.drawImage(canvas, 0, 0);

BV.resizeCanvas(tempCanvas, resizedDimensions.width, resizedDimensions.height);

pcCanvas.reset({
width: resizedDimensions.width,
height: resizedDimensions.height,
image: tempCanvas
});

layerManager.update(0);
setCurrentLayer(pcCanvas.getLayer(0));
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());

isFirstImage = false;
}

/**
*
* @param convertedPsdObj - if flattened then without layerArr
* @param cropObj? - {x: number, y: number, width: number, height: number}
*/
function importAsImagePsd(convertedPsdObj, cropObj) {


function crop(targetCanvas, cropCanvas, cropObj) {
cropCanvas.width = cropCanvas.width;
cropCanvas.getContext('2d').drawImage(targetCanvas, -cropObj.x, -cropObj.y);
targetCanvas.width = cropObj.width;
targetCanvas.height = cropObj.height;
targetCanvas.getContext('2d').drawImage(cropCanvas, 0, 0);
}
if (cropObj && (cropObj.width !== convertedPsdObj.width ||cropObj.height !== convertedPsdObj.height)) {
let cropCanvas = BV.createCanvas(cropObj.width, cropObj.height);
convertedPsdObj.width = cropObj.width;
convertedPsdObj.height = cropObj.height;

if (!convertedPsdObj.layerArr) {
crop(convertedPsdObj.canvas, cropCanvas, cropObj);
}
if (convertedPsdObj.layerArr) {
for (let i = 0; i < convertedPsdObj.layerArr.length; i++) {
let item = convertedPsdObj.layerArr[i];
crop(item.canvas, cropCanvas, cropObj);
}
}
}


let resizedDimensions = getResizedDimensions(convertedPsdObj.width, convertedPsdObj.height);
convertedPsdObj.width = resizedDimensions.width;
convertedPsdObj.height = resizedDimensions.height;
if (!convertedPsdObj.layerArr) {
BV.resizeCanvas(convertedPsdObj.canvas, convertedPsdObj.width, convertedPsdObj.height);
}
if (convertedPsdObj.layerArr) {
for (let i = 0; i < convertedPsdObj.layerArr.length; i++) {
let item = convertedPsdObj.layerArr[i];
BV.resizeCanvas(item.canvas, convertedPsdObj.width, convertedPsdObj.height);
}
}

let layerIndex;
if (convertedPsdObj.layerArr) {
layerIndex = pcCanvas.reset({
width: convertedPsdObj.width,
height: convertedPsdObj.height,
layerArr: convertedPsdObj.layerArr
});
} else {
layerIndex = pcCanvas.reset({
width: convertedPsdObj.width,
height: convertedPsdObj.height,
image: convertedPsdObj.canvas
});
}
layerManager.update(layerIndex);
setCurrentLayer(pcCanvas.getLayer(layerIndex));
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());

isFirstImage = false;
}

function importAsLayer(canvas) {
BV.showImportAsLayerDialog({
target: pcWeb,
pcCanvas: pcCanvas,
importImage: canvas,
callback: function(transformObj) {
if (!transformObj) {
return;
}

BV.pcLog.pause();
pcCanvas.addLayer();
var layers = pcCanvas.getLayers();
var activeLayerIndex = layers.length - 1;
var activeLayerContext = pcCanvas.getLayerContext(activeLayerIndex);
BV.drawTransformedImageOnCanvas(activeLayerContext.canvas, canvas, transformObj);
setCurrentLayer(pcCanvas.getLayer(activeLayerIndex));
layerManager.update(activeLayerIndex);

BV.pcLog.pause(false);

BV.pcLog.add({
tool: ["misc"],
action: "importImage",
params: [BV.copyCanvas(activeLayerContext.canvas)]
});
}
});
}


if(optionStr === 'default' || !optionStr) {
BV.showImportImageDialog({
image: importedImage,
target: pcWeb,
maxSize: klekiMaxCanvasSize,
callback: function(res) {
if (res.type === 'as-image') {
importAsImage(res.image);
} else if (res.type === 'as-image-psd') {
importAsImagePsd(res.image, res.cropObj);
} else if (res.type === 'as-layer') {
importAsLayer(res.image);
} else if (res.type === 'cancel') {

}
}
});
}

if(optionStr === 'layer') {
importAsLayer(importedImage.canvas);
}
if(optionStr === 'image') {
if (importedImage.type === 'psd') {
importAsImagePsd(importedImage);
} else {
importAsImage(importedImage.canvas);
}
}

}

function handlePaste(e) {
if (KLEKI.isInDialog > 0) {
return;
}

function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
if (pasteEvent.clipboardData == false) {
if (typeof (callback) == "function") {
callback(undefined);
}
}

var items = pasteEvent.clipboardData.items;

if (items == undefined) {
if (typeof (callback) == "function") {
callback(undefined);
}
}

for (var i = 0; i < items.length; i++) {
if (items[i].type.indexOf("image") == -1) {
continue;
}
var blob = items[i].getAsFile();

if (typeof (callback) == "function") {
callback(blob);
}
}
}

e.stopPropagation();
e.preventDefault();

retrieveImageFromClipboardAsBlob(e, function (imageBlob) {

if (imageBlob) {
var img = new Image();
img.onload = function () {
importFinishedLoading({
type: 'image',
width: img.width,
height: img.height,
canvas: img
}, 'default');
};
var URLObj = window.URL || window.webkitURL;
img.src = URLObj.createObjectURL(imageBlob);
}
});
}

function handleFileSelect(files, optionStr) {

function showWarningPsdFlattened() {
BV.popup({
target: pcWeb,
type: "warning",
message: "Unsupported features. PSD had to be flattened.<br /><br />",
buttons: ["Ok"],
callback: function (result) {
}
});
}


for (var i = 0, file; file = files[i]; i++) {
var extension = file.name.split(".");
extension = extension[extension.length - 1].toLowerCase();
if (extension === "psd") {

let loaderSizeBytes = 1024 * 1024 * 25;
let maxSizeBytes = 1024 * 1024 * 1024;
let maxResolution = 4096;

if (file.size >= maxSizeBytes) {
BV.popup({
target: pcWeb,
type: "error",
message: "File too big. Unable to import.<br /><br />",
buttons: ["Ok"],
callback: function (result) {
}
});
continue;
}

let doShowLoader = files.length === 1 && file.size >= loaderSizeBytes;
let loaderIsOpen = true;
let closeLoader;

if (doShowLoader) {
BV.popup({
target: pcWeb,
message: "Opening file...",
callback: function (result) {
loaderIsOpen = false;
closeLoader = null;
},
closefunc: function (f) {
closeLoader = f;
}
});
}


var reader = new FileReader();
reader.onload = function (readerResult) {

if (doShowLoader && !loaderIsOpen) {
return;
}

try {

let psd;


psd = agPsd.readPsd(
readerResult.target.result,
{
skipLayerImageData: true,
skipThumbnail: true,
skipCompositeImageData: true
});
if (psd.width > maxResolution || psd.height > maxResolution) {
if (closeLoader) {
closeLoader();
}
BV.popup({
target: pcWeb,
type: "error",
message: "Image exceeds maximum dimensions of "+maxResolution+" x "+maxResolution+" pixels. Unable to import."
+ "<br /><br />"
+ "Image size: " + psd.width + " x " + psd.height + ' pixels'
+ "<br /><br />"
,
buttons: ["Ok"],
callback: function (result) {
}
});
return;
}



psd = null;

try {
psd = agPsd.readPsd(readerResult.target.result);
} catch (e) {

}
if (psd) {

let convertedPsd = BV.PSD.readPsd(psd);

if (optionStr === 'image' && convertedPsd.error) {
showWarningPsdFlattened();
}

if (closeLoader) {
closeLoader();
}
importFinishedLoading(convertedPsd, optionStr);
} else {
psd = agPsd.readPsd(readerResult.target.result, { skipLayerImageData: true, skipThumbnail: true });
if (optionStr === 'image') {
showWarningPsdFlattened();
}

if (closeLoader) {
closeLoader();
}
importFinishedLoading({
type: 'psd',
width: psd.width,
height: psd.height,
canvas: psd.canvas,
error: true
}, optionStr);
}


} catch (e) {
if (closeLoader) {
closeLoader();
}

BV.popup({
target: pcWeb,
type: "error",
message: "Failed to load PSD.<br /><br />",
buttons: ["Ok"],
callback: function (result) {
}
});
}

};
reader.readAsArrayBuffer(file);

} else if (file.type.match('image.*')) {
(function (f) {
window.URL = window.URL || window.webkitURL;
var url = window.URL.createObjectURL(f);
var im = new Image();
im.src = url;
BV.loadImage(im, function () {
importFinishedLoading({
type: 'image',
width: im.width,
height: im.height,
canvas: im
}, optionStr);
});
})(file);
}


}
}

let pcImageDropper = new BV.PcImageDropper({
target: document.body,
onDrop: function(files, optionStr) {
if (KLEKI.isInDialog > 0) {
return;
}
handleFileSelect(files, optionStr);
},
enabledTest: function() {
return !KLEKI.isInDialog;
}
});

BV.addEventListener(window, 'paste', handlePaste, false);
var brushUiObj = {};


for (var b in BV.BrushLibUI) {
if (BV.BrushLibUI.hasOwnProperty(b)) {
let ui = new BV.BrushLibUI[b].Ui({
onSizeChange: sizeWatcher,
onOpacityChange: function(opacity) {
brushSettingService.emitOpacity(opacity);
}
});
brushUiObj[b] = ui;
ui.getElement().style.padding = 10 + 'px';
if (brushUiObj[b].setRequestCanvas) {
brushUiObj[b].setRequestCanvas(function () {
return pcCanvas;
});
}
}
}


BV.css(div, {
position: 'absolute',
left: 0,
top: 0,
right: 0,
bottom: 0
});

let output = new BV.Output();

var toolspace = document.createElement("div");
toolspace.oncontextmenu = function () {
return false;
};
toolspace.onclick = BV.handleClick;
/*BV.addEventListener(toolspace, 'touchend', function(e) {
e.preventDefault();
return false;
});*/


let toolspaceCollapser = new BV.ToolspaceCollapser({
onChange: function() {
updateCollapse();
}
});
function updateCollapse() {


if (width < collapseThreshold) {
toolspaceCollapser.getElement().style.display = 'block';

toolspaceCollapser.setDirection(uiState);
if (toolspaceCollapser.isOpen()) {
if (uiState === 'left') {
BV.css(toolspaceCollapser.getElement(), {
left: '271px',
right: '',
});
BV.css(pcCanvasWorkspace.getElement(), {
left: '271px'
});
} else {
BV.css(toolspaceCollapser.getElement(), {
left: '',
right: '271px'
});
BV.css(pcCanvasWorkspace.getElement(), {
left: '0'
});
}
toolspace.style.display = 'block';
pcCanvasWorkspace.setSize(Math.max(0, width - toolwidth), height);
output.setWide(false);

} else {
if (uiState === 'left') {
BV.css(toolspaceCollapser.getElement(), {
left: '0',
right: '',
});
BV.css(pcCanvasWorkspace.getElement(), {
left: '0'
});
} else {
BV.css(toolspaceCollapser.getElement(), {
left: '',
right: '0'
});
BV.css(pcCanvasWorkspace.getElement(), {
left: '0'
});
}
toolspace.style.display = 'none';
pcCanvasWorkspace.setSize(Math.max(0, width), height);
output.setWide(true);

}

} else {
toolspaceCollapser.getElement().style.display = 'none';
if (uiState === 'left') {
BV.css(pcCanvasWorkspace.getElement(), {
left: '271px'
});
} else {
BV.css(pcCanvasWorkspace.getElement(), {
left: '0'
});
}
toolspace.style.display = 'block';
pcCanvasWorkspace.setSize(Math.max(0, width - toolwidth), height);
output.setWide(false);

}
}
updateCollapse();

function updateUi() {
if (uiState === 'left') {
BV.css(toolspace, {
left: 0,
right: '',
borderLeft: 'none',
borderRight: '1px solid rgb(135, 135, 135)'
});
BV.css(pcCanvasWorkspace.getElement(), {
left: '271px'
});
} else {
BV.css(toolspace, {
left: '',
right: 0,
borderLeft: '1px solid rgb(135, 135, 135)',
borderRight: 'none'
});
BV.css(pcCanvasWorkspace.getElement(), {
left: '0'
});
}
output.setUiState('' + uiState);
layerPreview.setUiState('' + uiState);
layerManager.setUiState('' + uiState);
updateCollapse();
}



let overlayToolspace;
setTimeout(function() {
overlayToolspace = new BV.OverlayToolspace({
enabledTest: function() {
return !KLEKI.isInDialog && !lineSanitizer.getIsDrawing();
},
brushSettingService: brushSettingService
});
div.appendChild(overlayToolspace.getElement());
}, 0);

div.appendChild(pcCanvasWorkspace.getElement());
div.appendChild(toolspace);
div.appendChild(toolspaceCollapser.getElement());

BV.css(toolspace, {
position: "absolute",
right: 0,
top: 0,
bottom: 0,
width: (toolwidth - 1) + "px",

overflow: "hidden",
backgroundColor: "#ddd",
borderLeft: "1px solid rgb(135, 135, 135)",
userSelect: 'none',
touchAction: 'none'
});

let toolspaceTopRow = new BV.ToolspaceTopRow({
onKleki: function() {
showIframePopup('./home/', pcWeb);
},
onNew: function() {
showNewImageDialog();
},
onImport: function() {
fileDiv.getImportButton().click();
},
onSave: function() {
saveImageToComputer();
},
onShare: function() {
shareImage();
},
onHelp: function() {
showIframePopup('./help/', div);
},
});
BV.addClassName(toolspaceTopRow.getElement(), 'toolspace-row-shadow');
toolspaceTopRow.getElement().style.marginBottom = '10px';
toolspace.appendChild(toolspaceTopRow.getElement());

let toolspaceToolRow = new BV.ToolspaceToolRow({
onActivate: function(activeStr) {
if(activeStr === 'draw') {
pcCanvasWorkspace.setMode('draw');
} else if(activeStr === 'hand') {
pcCanvasWorkspace.setMode('hand');
} else if(activeStr === 'fill') {
pcCanvasWorkspace.setMode('fill');
} else if(activeStr === 'text') {
pcCanvasWorkspace.setMode('text');
} else if(activeStr === 'shape') {
pcCanvasWorkspace.setMode('shape');
} else {
throw new Error('unknown activeStr');
}
mainTabRow.open(activeStr);
updateMainTabVisibility();
pcColorSlider.pickingDone();
},
onZoomIn: function() {
pcCanvasWorkspace.zoomByStep(keyListener.isPressed('shift') ? 1/8 : 1/2);
},
onZoomOut: function() {
pcCanvasWorkspace.zoomByStep(keyListener.isPressed('shift') ? -1/8 : -1/2);
},
onUndo: function() {
execUndo();
},
onRedo: function() {
execRedo();
}
});
BV.pcLog.addListener(function() {
toolspaceToolRow.setEnableUndo(BV.pcLog.canUndo());
toolspaceToolRow.setEnableRedo(BV.pcLog.canRedo());
});
BV.addClassName(toolspaceToolRow.getElement(), 'toolspace-row-shadow');
toolspace.appendChild(toolspaceToolRow.getElement());

BV.pcLog.addListener(function (logParam) {


if (logParam && logParam.bufferUpdate) {
var brushes = initState.brushes;
var actions = [logParam.bufferUpdate];
var localCurrentLayerCtx = initState.canvas.getLayerContext(initState.focus);
var canvas = initState.canvas;
var layerIndex = initState.focus;
(function (i) {
if (actions[i].tool[0] === "brush") {
var b = brushes[actions[i].tool[1]];
if (actions[i].actions) {
for (var e = 0; e < actions[i].actions.length; e++) {
var p = actions[i].actions[e].params;
b[actions[i].actions[e].action].apply(b, p);
}
} else {
var p = actions[i].params;
b[actions[i].action].apply(b, p);
}
} else if (actions[i].tool[0] === "canvas") {
var p = actions[i].params;
var id = canvas[actions[i].action].apply(canvas, p);
if (typeof id === typeof 123) {
layerIndex = id;
localCurrentLayerCtx = canvas.getLayerContext(layerIndex);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(localCurrentLayerCtx);
}
}
}
} else if (actions[i].tool[0] === "filter") {
var p = [{
context: localCurrentLayerCtx,
canvas: canvas,
input: actions[i].params[0].input,
logger: {
add: function () {
}, pause: function () {
}
}
}];
BV.FilterLib[actions[i].tool[1]][actions[i].action].apply(null, p);
} else if (actions[i].tool[0] === "misc" && actions[i].action === "focusLayer") {
layerIndex = actions[i].params[0];
localCurrentLayerCtx = canvas.getLayerContext(actions[i].params[0]);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(localCurrentLayerCtx);
}
}
} else if (actions[i].tool[0] === "misc" && actions[i].action === "importImage") {
var id = canvas.addLayer();
if (typeof id === typeof 123) {
layerIndex = id;
localCurrentLayerCtx = canvas.getLayerContext(layerIndex);
for (var b in brushes) {
if (brushes.hasOwnProperty(b)) {
brushes[b].setContext(localCurrentLayerCtx);
}
}
}
localCurrentLayerCtx.drawImage(actions[i].params[0], 0, 0);
}
})(0);
initState.focus = layerIndex;
}
});

function setCurrentBrush(brushId) {
if (brushId !== 'eraser') {
lastNonEraserBrushId = brushId;
}

if(pcColorSlider) {
if (brushId === 'eraser') {
pcColorSlider.enable(false);
} else {
pcColorSlider.enable(true);
}
}

currentBrushId = brushId;
currentBrush = brushUiObj[brushId];
currentBrush.setColor(currentColor);
currentBrush.setContext(currentLayerCtx);
pcCanvasWorkspace.setMode('draw');
toolspaceToolRow.setActive('draw');
updateMainTabVisibility();
}

function setCurrentLayer(layer) {
currentLayerCtx = layer.context;
currentBrush.setContext(layer.context);
layerPreview.setLayer(layer);
}

function setBrushColor(p_color) {
currentColor = p_color;
currentBrush.setColor(p_color);



brushSettingService.emitColor(p_color);
pcColorSlider.pickingDone();
}

setCurrentBrush('defaultBrush');

var pcColorSlider = new BV.PcColorSlider({
width: 250,
height: 30,
svHeight: 100,
startValue: new BV.RGB(0, 0, 0),
onPick: setBrushColor
});
pcColorSlider.setHeight(Math.max(163, Math.min(400, height - 505)));
pcColorSlider.setPickCallback(function (doPick) {

if(doPick) {
pcCanvasWorkspace.setMode('pick');
} else {
pcCanvasWorkspace.setMode(toolspaceToolRow.getActive());
updateMainTabVisibility();
}

});
var brushDiv = document.createElement("div");
let colorDiv = document.createElement("div");
BV.css(colorDiv, {
margin: '10px',
display: 'flex',
flexWrap: 'wrap',
justifyContent: 'space-between',
alignItems: 'flex-end'
});
let toolspaceStabilizerRow = new BV.ToolspaceStabilizerRow({
smoothing: 1,
onSelect: function(v) {
lineSmoothing.setSmoothing(translateSmoothing(v));
}
});


brushDiv.appendChild(colorDiv);
colorDiv.appendChild(pcColorSlider.getElement());
colorDiv.appendChild(pcColorSlider.getOutputElement());
colorDiv.appendChild(toolspaceStabilizerRow.getElement());

var brushTabRow = new BV.TabRow({
initialId: 'defaultBrush',
useAccent: true,
tabArr: (function () {
var result = [];
var counter = 0;

function createTab(keyStr) {
let result = {
id: keyStr,
image: BV.BrushLibUI[keyStr].image,
title: BV.BrushLibUI[keyStr].tooltip,
onOpen: function() {
brushUiObj[keyStr].getElement().style.display = 'block';
setCurrentBrush(keyStr);
pcColorSlider.pickingDone();
brushSettingService.emitSliderConfig({
sizeSlider: BV.BrushLibUI[keyStr].sizeSlider,
opacitySlider: BV.BrushLibUI[keyStr].opacitySlider
});
sizeWatcher(brushUiObj[keyStr].getSize());
brushSettingService.emitOpacity(brushUiObj[keyStr].getOpacity());
},
onClose: function() {
brushUiObj[keyStr].getElement().style.display = 'none';
}
};
return result;
}

let keyArr = Object.keys(brushUiObj);
for(let i = 0; i < keyArr.length; i++) {
result.push(createTab(keyArr[i]));
}
return result;
})()
});
brushDiv.appendChild(brushTabRow.getElement());
for (var b in BV.BrushLibUI) {
if (BV.BrushLibUI.hasOwnProperty(b)) {
brushDiv.appendChild(brushUiObj[b].getElement());
}
}

let handUi = new BV.HandUi({
scale: 1,
angleDeg: 0,
onReset: function() {
pcCanvasWorkspace.resetView(true);
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
},
onFit: function() {
pcCanvasWorkspace.fitView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
},
onAngleChange: function(angleDeg, isRelative) {
pcCanvasWorkspace.setAngle(angleDeg, isRelative);
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
},
});

let fillUi = new BV.FillUi({
colorSlider: pcColorSlider
});

let textUi = new BV.TextUi({
colorSlider: pcColorSlider
});

let shapeUi = new BV.ShapeUi({
colorSlider: pcColorSlider
});

let shapeTool = new BV.ShapeTool({
onShape: function(isDone, x1, y1, x2, y2, angleRad) {

let layerIndex = pcCanvas.getLayerIndex(currentLayerCtx.canvas);

let shapeObj = {
type: shapeUi.getShape(),
x1: x1,
y1: y1,
x2: x2,
y2: y2,
angleRad: angleRad,
isOutwards: shapeUi.getIsOutwards(),
opacity: shapeUi.getOpacity(),
isEraser: shapeUi.getIsEraser()
};
if (shapeUi.getShape() === 'line') {
shapeObj.strokeRgb = pcColorSlider.getColor();
shapeObj.lineWidth = shapeUi.getLineWidth();
shapeObj.isAngleSnap = shapeUi.getIsSnap() || keyListener.isPressed('shift');
} else {
shapeObj.isFixedRatio = shapeUi.getIsFixed() || keyListener.isPressed('shift');
if (shapeUi.getMode() === 'stroke') {
shapeObj.strokeRgb = pcColorSlider.getColor();
shapeObj.lineWidth = shapeUi.getLineWidth();
} else {
shapeObj.fillRgb = pcColorSlider.getColor();
}
}

if (isDone) {
pcCanvas.setComposite(layerIndex, null);
pcCanvas.drawShape(layerIndex, shapeObj);
} else {
pcCanvas.setComposite(layerIndex, {
draw: function(ctx) {
BV.drawShape(ctx, shapeObj);
}
});
}
pcCanvasWorkspace.requestFrame();

}
});

var layerManager = new BV.pcLayerManager(pcCanvas, function (val) {
setCurrentLayer(pcCanvas.getLayer(val));
BV.pcLog.add({
tool: ["misc"],
action: "focusLayer",
params: [val]
});
}, div);
var layerPreview = new BV.LayerPreview({
onClick: function () {
mainTabRow.open('layers');
}
});

layerPreview.setLayer(pcCanvas.getLayer(pcCanvas.getLayerIndex(currentLayerCtx.canvas)));


function createFilterDiv() {
var menu = document.createElement("div");

function asyncInit() {
let hasWebGl = BV.hasWebGl();
var filterView = false;
var filters = BV.FilterLib;
var buttons = [];

if (!filters || filters.length === 0) {
throw new Error('filters not loaded');
}

function createButton(filterKey, filterArr) {
var button = document.createElement("button");
var buttonLabel = filterArr[filterKey].buttonLabel ? filterArr[filterKey].buttonLabel : filterArr[filterKey].name;
var name = filterArr[filterKey].name;
var im = '<img src="0-4-15--176eb290fdd/img/' + filterArr[filterKey].icon + '" alt="' + name + '" />';
if (name.length > 11) {
name = "<span style='font-size: 12px'>" + buttonLabel + "</span>";
}
button.innerHTML = im + name;
button.className = "gridButton";
button.tabIndex = -1;
button.onclick = function () {

function finishedDialog(result, filterDialog) {
if (result == "Cancel") {
return;
}
let input;
try {
input = filterDialog.getInput();
} catch (e) {
if(e.message.indexOf('filterDialog.getInput is not a function') !== -1) {
throw 'filterDialog.getInput is not a function, filter: ' + filterArr[filterKey].name;
} else {
throw e;
}
}
applyFilter(input);
}

if (!('apply' in filterArr[filterKey])) {
alert('Application not fully loaded');
return;
}

function applyFilter(input) {
var filterResult = filterArr[filterKey].apply({
context: currentLayerCtx,
canvas: pcCanvas,
logger: BV.pcLog,
input: input
});
if (filterResult === false) {
alert("Couldn't apply the edit action");
}
if (filterArr[filterKey].updateContext === true) {
setCurrentLayer(pcCanvas.getLayer(layerManager.getSelected()));


}
if (filterArr[filterKey].updatePos === true) {
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
}
layerManager.update();
}

if (!filterArr[filterKey].isInstant) {
let secondaryColorRGB = pcColorSlider.getSecondaryRGB();
let filterDialog = filterArr[filterKey].getDialog({
context: currentLayerCtx,
canvas: pcCanvas,
maxWidth: klekiMaxCanvasSize,
maxHeight: klekiMaxCanvasSize,
currentColorRgb: {r: currentColor.r, g: currentColor.g, b: currentColor.b},
secondaryColorRgb: {r: secondaryColorRGB.r, g: secondaryColorRGB.g, b: secondaryColorRGB.b}
});

if (!filterDialog) {
return;


}

let closefunc;
filterDialog.errorCallback = function(e) {
setTimeout(function() {
alert('Error: could not perform action');
throw(e);
}, 0);
closefunc();
};


let style = {};
if('width' in filterDialog) {
style.width = filterDialog.width + 'px'
}

BV.popup({
target: pcWeb,
message: "<b>" + filterArr[filterKey].name + "</b>",
div: filterDialog.element,
style: style,
buttons: ["Ok", "Cancel"],
callback: function(result) {
finishedDialog(result, filterDialog);
},
closefunc: function (func) {
closefunc = func;
}
});
} else {
button.blur();
applyFilter(null);
}

}
buttons[buttons.length] = button;
return button;
}

function createDisabledButton(filterKey, filterArr) {
if (!filterArr[filterKey].webgl && !filterArr[filterKey].ieFails) {
return;
}
if (filterArr[filterKey].ieFails && navigator.appName !== 'Microsoft Internet Explorer') {
return;
}
var buttonLabel = filterArr[filterKey].buttonLabel ? filterArr[filterKey].buttonLabel : filterArr[filterKey].name;
var button = document.createElement("button");
var im = '<img style="opacity: 0.5" src="img/' + filterArr[filterKey].icon + '" />';
var name = filterArr[filterKey].name;
if (name.length > 11) {
name = "<span style='font-size: 12px'>" + buttonLabel + "</span>";
}
button.innerHTML = im + name;
button.className = "gridButton";
button.disabled = "disabled";
return button;
}

function addGroup(groupArr, filterArr, targetEl) {
for (var filterKey in filterArr) {
if (filterArr.hasOwnProperty[filterKey] || !groupArr.includes(filterKey)) {
continue;
}
if ((filterArr[filterKey].webgl && hasWebGl)
|| (filterArr[filterKey].neededWithWebGL)
|| (!filterArr[filterKey].webgl && !hasWebGl)
&& !(filterArr[filterKey].ieFails && navigator.appName == 'Microsoft Internet Explorer')) {

targetEl.appendChild(createButton(filterKey, filterArr));

} else {
targetEl.appendChild(createDisabledButton(filterKey, filterArr));
filterArr[filterKey] = undefined;
}
}
}

var groupA = [
'cropExtend',
'flip',
'glPerspective',
'resize',
'rotate',
'transform'
];
var groupB = [];
for (var filterKey in filters) {
if (filters.hasOwnProperty[filterKey] || groupA.includes(filterKey)) {
continue;
}
groupB.push(filterKey);
}

addGroup(groupA, filters, menu);
var hrEl = document.createElement("div");
hrEl.className = "gridHr";
menu.appendChild(hrEl);
addGroup(groupB, filters, menu);


if (!hasWebGl) {
let webglnote = BV.appendTextDiv(menu, "Some actions are disabled because WebGL isn't working.");
webglnote.style.margin = "10px";
BV.css(webglnote, {
fontSize: "11px",
color: "#555",
background: "#ffe",
padding: "10px",
borderRadius: "10px",
textAlign: "center"
});
}
}

setTimeout(asyncInit, 1);

return menu;
}

var filterDiv = createFilterDiv();

function showNewImageDialog() {
BV.newImageDialog({
currentColor: currentColor,
secondaryColor: pcColorSlider.getSecondaryRGB(),
maxCanvasSize: klekiMaxCanvasSize,
canvasWidth: pcCanvas.width,
canvasHeight: pcCanvas.height,
workspaceWidth: window.innerWidth < collapseThreshold ? width : width - toolwidth,
workspaceHeight: height,
onConfirm: function(width, height, color) {
pcCanvas.reset({
width: width,
height: height,
color: color.a === 1 ? color : null
});

layerManager.update(0);
setCurrentLayer(pcCanvas.getLayer(0));
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());

isFirstImage = false;
},
onCancel: function() {}
});
}

function shareImage(callback) {
BV.shareCanvas({
canvas: pcCanvas.getCompleteCanvas(1),
fileName: BV.getDate() + 'Kleki.png',
title: BV.getDate() + 'Kleki.png',
callback: callback ? callback : function() {}
});
}

function createFileDiv() {
"use strict";

var div = document.createElement("div");

function asyncCreation() {
var fileView = false;
var filemenu = document.createElement("div");
var newbutton = document.createElement("button");
var savebutton = document.createElement("button");
var shareButton = document.createElement("button");
var storebutton = document.createElement("button");
var clearbutton = document.createElement("button");
var uploadImgurButton = document.createElement("button");
var uploadInkButton = document.createElement("button");
var checkPNG = document.createElement("input");


newbutton.tabIndex = -1;
savebutton.tabIndex = -1;
shareButton.tabIndex = -1;
storebutton.tabIndex = -1;
clearbutton.tabIndex = -1;
uploadImgurButton.tabIndex = -1;
uploadInkButton.tabIndex = -1;
checkPNG.tabIndex = -1;

newbutton.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/new-image.png' alt='New Image'/>New";
savebutton.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/export.png' alt='Save Image' height='20'/>Save";
shareButton.innerHTML = "<img src='0-4-15--176eb290fdd/img/ui/share.png' alt='Share Image' height='20'/>Share";
storebutton.textContent = "Store";
clearbutton.textContent = "Clear";
uploadImgurButton.innerHTML = "<img style='float:left' src='0-4-15--176eb290fdd/img/ui/upload.png' alt='Upload to Imgure'/>Public";
uploadInkButton.innerHTML = "<img style='float:left' src='0-4-15--176eb290fdd/img/ui/upload.png' alt='Upload to Drive/...'/>Drive / ...";
newbutton.className = "gridButton";
savebutton.className = "gridButton";
shareButton.className = "gridButton";
storebutton.className = "gridButton";
clearbutton.className = "gridButton";
uploadImgurButton.className = "gridButton";
uploadInkButton.className = "gridButton";




checkPNG.type = "checkbox";
checkPNG.style.cssFloat = "left";
checkPNG.checked = exportPNG;


var importbutton = document.createElement("input");
importbutton.tabIndex = -1;
importbutton.type = "file";
importbutton.multiple = true;
importbutton.accept = "image";
importbutton.size = "71";
importbutton.textContent = "Import";
var importWrapper = importbutton;
div.getImportButton = function() {
return importbutton;
}

function createImportButton() {
importWrapper = document.createElement("div");
importWrapper.className = "gridButton";
importWrapper.style.position = "relative";
importWrapper.style.cursor = "pointer";
importWrapper.style.cssFloat = "left";

var innerMask = document.createElement("div");
innerMask.style.width = "120px";
innerMask.style.height = "28px";
innerMask.style.overflow = "hidden";
innerMask.style.cursor = "pointer";
innerMask.style.position = "relative";

importWrapper.appendChild(innerMask);
innerMask.appendChild(importbutton);

var importFakeButton = document.createElement("button");
importFakeButton.innerHTML = "<img style='float:left' src='0-4-15--176eb290fdd/img/ui/import.png' alt='Import Image'/>Import";
importFakeButton.tabIndex = -1;

BV.css(importFakeButton, {
width: "120px",
display: "box",
position: "absolute",
left: 0,
top: 0,
cursor: "pointer"
});
BV.css(importbutton, {
display: 'none'
});
importWrapper.appendChild(importFakeButton);

importFakeButton.onclick = function() {
importbutton.click();
}
}

createImportButton();

importbutton.onchange = function (e) {
handleFileSelect(importbutton.files, 'default');
importbutton.value = "";
};

checkPNG.onchange = function () {
exportPNG = checkPNG.checked;
};



let exportTypeWrapper;
let exportTypeSelect;
{
exportTypeWrapper = BV.el({
css: {
fontSize: '15px',
marginLeft: '10px',
marginTop: '10px',
cssFloat: 'left',
width: 'calc(50% - 15px)'
}
});
exportTypeSelect = new BV.Select({
optionArr: [
['png', 'Save PNG'],
['psd', 'Save PSD'],
['layers', 'Save Layers'],
],
initValue: exportType,
allowScroll: false,
onChange: function(val) {
exportType = val;
saveImageToComputer();
}
});
exportTypeWrapper.appendChild(exportTypeSelect.getElement());

}



newbutton.onclick = showNewImageDialog;
savebutton.onclick = function () {
saveImageToComputer();
};
shareButton.onclick = function() {
shareButton.disabled = true;
shareImage(function() {
shareButton.disabled = false;
});
};
storebutton.onclick = function () {
saveToBrowserStorage({
doShowPopup: true,
storeButton: storebutton,
clearButton: clearbutton
});
};
clearbutton.onclick = function () {
BV.browserStorage.clear(function() {
BV.popup({
target: pcWeb,
type: "ok",
message: "Cleared Browser Storage.",
buttons: ["Ok"],
callback: function (result) {
BV.browserStorage.isEmpty(function(b) {
clearbutton.disabled = b;
storebutton.textContent = b ? 'Store' : 'Overwrite';
});
}
});
}, function(error) {
BV.popup({
target: pcWeb,
type: "error",
message: "Failed to clear.",
buttons: ["Ok"],
callback: function (result) {
BV.browserStorage.isEmpty(function(b) {
clearbutton.disabled = b;
storebutton.textContent = b ? 'Store' : 'Overwrite';
});
}
});
});
};
uploadImgurButton.onclick = function () {
if (!isUploadAllowed()) {
alert("Nothing to upload.");
return;
}

var inputTitle = document.createElement("input");
inputTitle.type = "text";
inputTitle.value = "Untitled";
var inputDescription = document.createElement("textarea");
inputDescription.cols = 30;
inputDescription.rows = 2;
var labelTitle = document.createElement("div");
labelTitle.textContent = "Title:";
var labelDescription = document.createElement("div");
labelDescription.innerHTML = "<br>Caption:";

var tos = document.createElement("div");
tos.innerHTML = "<br/><a href=\"https://imgur.com/tos\" target=\"_blank\" rel=\"noopener noreferrer\">Terms of Service</a> for imgur.com";

function doUpload() {
var img = pcCanvas.getCompleteCanvas(1).toDataURL("image/jpeg").split(',')[1];

var w = window.open();
var label = w.document.createElement("div");
var gif = w.document.createElement("img");
gif.src = "https://bitbof.com/doodler/loading.gif";
label.appendChild(gif);
BV.css(gif, {
filter: "invert(1)"
});
w.document.body.style.backgroundColor = "#121211";
w.document.body.style.backgroundImage = "linear-gradient(#2b2b2b 0%, #121211 50%)";
w.document.body.style.backgroundRepeat = "no-repeat";
var labelText = w.document.createElement("div");
labelText.style.marginTop = "10px";
label.appendChild(labelText);
labelText.textContent = "Uploading...";

w.document.body.appendChild(label);
BV.css(label, {
marginLeft: "auto",
marginRight: "auto",
marginTop: "100px",
fontFamily: "Arial, sans-serif",
fontSize: "20px",
textAlign: "center",
transition: "opacity 0.3s ease-in-out",
opacity: 0,
color: "#ccc"
});
setTimeout(function () {
label.style.opacity = 1;
}, 20);

function failScenario() {
w.close();
alert('Upload Failed. Sorry.');
}


var fd = new FormData();
fd.append("image", img);
fd.append("title", inputTitle.value);
fd.append("description", inputDescription.value);
var xhr = new XMLHttpRequest();


var timedOut = false;
var isSending = true;
xhr.onreadystatechange = function () {
if (timedOut) {
return;
}
if (xhr.readyState === 4 && xhr.status === 200) {
isSending = false;

var response = JSON.parse(xhr.responseText);
w.location.href = response.data.link.replace(".jpg", "") + "?tags";
var responseData = JSON.parse(xhr.responseText);

BV.popup({
target: pcWeb,
type: "ok",
message: "<h3>Upload Successful</h3><br>To delete your image from imgur go here:<br><a target='_blank' rel=\"noopener noreferrer\" href='https://imgur.com/delete/" + responseData.data.deletehash + "'>imgur.com/<b>delete</b>/" + responseData.data.deletehash + "</a><br><br>",
buttons: ["Ok"],
callback: function (result) {
}
});

resetSaveReminder();

} else if (xhr.readyState === 4) {
isSending = false;
failScenario();
}
};
xhr.upload.onprogress = function (oEvent) {
if (oEvent.lengthComputable) {
var percentComplete = oEvent.loaded / oEvent.total;
labelText.textContent = " Uploading..." + parseInt(percentComplete * 99, 10) + "%";
} else {
}
};
xhr.open("POST", "https://api.imgur.com/3/image.json", true);
xhr.setRequestHeader('Authorization', 'Client-ID 1f46dfe8d78dad2');
xhr.send(fd);
setTimeout(function () {
if (!isSending) {
return;
}
timedOut = true;
failScenario();
}, 1000 * 60);
}

var outDiv = document.createElement("div");
var infoHint = document.createElement("div");
infoHint.className = "info-hint";
infoHint.textContent = "Anyone with the link to your uploaded image will be able to view it.";
outDiv.appendChild(infoHint);
outDiv.appendChild(labelTitle);
outDiv.appendChild(inputTitle);
outDiv.appendChild(labelDescription);
outDiv.appendChild(inputDescription);
outDiv.appendChild(tos);
BV.popup({
target: pcWeb,
message: "<b>Image Upload to Imgur (public)</b>",
type: "upload",
div: outDiv,
buttons: ["Upload", "Cancel"],
callback: function (val) {
if (val === "Upload" || val === "Yes" || val === "Ok") {
doUpload();
}
}
});
};


uploadInkButton.onclick = function () {
if (!isUploadAllowed()) {
alert("Nothing to upload.");
return;
}

resetSaveReminder();

var imgDataUrl = pcCanvas.getCompleteCanvas(1).toDataURL("image/png").split(',', 2)[1];

var first = true;
var progress = new BV.ProgressPopup({
callback: function () {
pcWeb.removeChild(progress.getDiv());
}
});


function write(file, base64Data) {
if (first) {
first = false;
pcWeb.appendChild(progress.getDiv());
}

filepicker.write(file, base64Data, {
base64decode: !0
}, function (file) {
progress.update(100, true);
}, function (file) {
progress.update(-1);
}, function (file) {
progress.update(file);
})
}

var e = this;
var fpf = {
url: "https://kleki.com/0-4-15--176eb290fdd/img/blank_for_filepicker.png",
filename: BV.getDate() + "Kleki",
mimetype: "image/png",
isWriteable: true
};

function onFilepickerLoaded() {
filepicker.exportFile(fpf, {
services: ["GOOGLE_DRIVE", "DROPBOX", "FLICKR", "PICASA", "BOX", "EVERNOTE"]
}, function (file) {


var fpShade = document.getElementById("filepicker_shade");
if (fpShade) {
fpShade.onclick();
}

setTimeout(function () {
write(file, imgDataUrl);
}, 0);
});
}

var intervalId;
intervalId = setInterval(function () {
if (window.filepicker && window.filepicker.exportFile) {
clearInterval(intervalId);
onFilepickerLoaded();
}
}, 100);


(function (a) {
if (window.filepicker) {
return
}
var b = a.createElement("script");
b.type = "text/javascript";
b.async = !0;
b.src = ("https:" === a.location.protocol ? "https:" : "http:") + "//api.filepicker.io/v1/filepicker.js";
var c = a.getElementsByTagName("script")[0];
c.parentNode.insertBefore(b, c);
var d = {};
d._queue = [];
var e = "pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");
var f = function (a, b) {
return function () {
b.push([a, arguments])
}
};
for (var g = 0; g < e.length; g++) {
d[e[g]] = f(e[g], d._queue)
}
window.filepicker = d
})(document);
filepicker.setKey("A51vbok3OTKeTrXIoTLkxz");

};

var saveNote = document.createElement("div");
saveNote.textContent = "No autosave available";
BV.css(saveNote, {
textAlign: "center",
marginTop: "10px",
background: "rgb(243, 243, 161)",
marginLeft: "10px",
marginRight: "10px",
borderRadius: "4px",
padding: "5px",
color: 'rgba(0,0,0,0.65)'
});

function createSpacer() {
var el = document.createElement("div");
var clearer = document.createElement("div");
var line = document.createElement("div");
el.appendChild(clearer);
el.appendChild(line);
BV.css(clearer, {
clear: 'both'
});
BV.css(line, {
marginLeft: "10px",
marginRight: "10px",
marginTop: "10px",
borderBottom: "1px solid rgba(0,0,0,0.2)",
clear: 'both'
});
return el;
}

var headlineLocalStorage = document.createElement("div");
headlineLocalStorage.innerHTML = "Browser Storage<br>";
BV.css(headlineLocalStorage, {
marginLeft: "10px",
marginRight: "10px",
paddingTop: "5px",
marginBottom: "-5px"
});
var headlineUpload = document.createElement("div");
headlineUpload.innerHTML = "Upload<br>";
BV.css(headlineUpload, {
marginLeft: "10px",
marginRight: "10px",
paddingTop: "5px",
marginBottom: "-5px"
});



filemenu.appendChild(saveNote);
filemenu.appendChild(newbutton);
filemenu.appendChild(savebutton);
filemenu.appendChild(importWrapper);
filemenu.appendChild(exportTypeWrapper);
if(BV.canShareFiles()) {
filemenu.appendChild(shareButton);
}
filemenu.appendChild(createSpacer());
filemenu.appendChild(headlineLocalStorage);
filemenu.appendChild(storebutton);
filemenu.appendChild(clearbutton);
filemenu.appendChild(createSpacer());
filemenu.appendChild(headlineUpload);
filemenu.appendChild(uploadImgurButton);
filemenu.appendChild(uploadInkButton);

div.appendChild(filemenu);



div.setIsVisible = function(b) {
if(b) {

BV.browserStorage.isEmpty(function(b) {
clearbutton.disabled = b;
storebutton.textContent = b ? 'Store' : 'Overwrite';
});

}
};
}
div.setIsVisible = function() {};
setTimeout(asyncCreation, 1);
return div;
}

var fileDiv = createFileDiv();
var mainTabRow = new BV.TabRow({
initialId: 'draw',
tabArr: [
{
id: 'draw',
label: 'Brush',
onOpen: function() {
if (currentBrushId === 'eraser') {
pcColorSlider.enable(false);
}
colorDiv.appendChild(pcColorSlider.getElement());
colorDiv.appendChild(pcColorSlider.getOutputElement());
colorDiv.appendChild(toolspaceStabilizerRow.getElement());
brushDiv.style.display = 'block';
},
onClose: function() {
brushDiv.style.display = 'none';
}
},
{
id: 'hand',
label: 'Hand',
isVisible: false,
onOpen: function() {
handUi.setIsVisible(true);
},
onClose: function() {
handUi.setIsVisible(false);
}
},
{
id: 'fill',
label: 'Fill',
isVisible: false,
onOpen: function() {
pcColorSlider.enable(true);
fillUi.setIsVisible(true);
},
onClose: function() {
fillUi.setIsVisible(false);
}
},
{
id: 'text',
label: 'Text',
isVisible: false,
onOpen: function() {
pcColorSlider.enable(true);
textUi.setIsVisible(true);
},
onClose: function() {
textUi.setIsVisible(false);
}
},
{
id: 'shape',
label: 'Shape',
isVisible: false,
onOpen: function() {
pcColorSlider.enable(true);
shapeUi.setIsVisible(true);
},
onClose: function() {
shapeUi.setIsVisible(false);
}
},
{
id: 'layers',
label: 'Layers',
onOpen: function() {
layerManager.update();
layerManager.style.display = 'block';
},
onClose: function() {
layerManager.style.display = 'none';
}
},
{
id: 'edit',
label: 'Edit',
onOpen: function() {
filterDiv.style.display = 'block';
},
onClose: function() {
filterDiv.style.display = 'none';
}
},
{
id: 'file',
label: 'File',
onOpen: function() {
fileDiv.style.display = 'block';
fileDiv.setIsVisible(true);
},
onClose: function() {
fileDiv.style.display = 'none';
fileDiv.setIsVisible(false);
}
}
]
});
function updateMainTabVisibility() {
if(!mainTabRow) {
return;
}

let toolObj = {
'draw': {},
'hand': {},
'fill': {},
'text': {},
'shape': {}
};

let activeStr = toolspaceToolRow.getActive();
let oldTabId = mainTabRow.getOpenedTabId();

let keysArr = Object.keys(toolObj);
for (let i = 0; i < keysArr.length; i++) {
if (activeStr === keysArr[i]) {
mainTabRow.setIsVisible(keysArr[i], true);
} else {
mainTabRow.setIsVisible(keysArr[i], false);
if (oldTabId === keysArr[i]) {
mainTabRow.open(activeStr);
}
}
}

}

function copyToClipboard() {
BV.clipboardDialog(pcWeb, pcCanvas.getCompleteCanvas(1), function (inputObj) {
if (inputObj.left === 0 && inputObj.right === 0 && inputObj.top === 0 && inputObj.bottom === 0) {
return;
}

var p = {
context: currentLayerCtx,
canvas: pcCanvas,
input: inputObj,
logger: BV.pcLog
};
BV.FilterLib.cropExtend.apply(p);
layerManager.update();
pcCanvasWorkspace.resetView();
handUi.update(pcCanvasWorkspace.getScale(), pcCanvasWorkspace.getAngleDeg());
});
}

/**
*
* @param p - {doShowPopup?: boolean, storeButton?: HTMLElement, clearButton?: HTMLElement}
*/
function saveToBrowserStorage(p) {
if (!p) {
p = {};
}
if (p.storeButton) {
p.storeButton.disabled = true;
p.storeButton.textContent = '...storing...';
}

function store(klekiProjectObj) {

BV.browserStorage.storeKlekiProjectObj(klekiProjectObj, function() {
if (p.storeButton) {
p.storeButton.disabled = false;
p.storeButton.textContent = 'Store';
}
resetSaveReminder();
BV.browserStorage.isEmpty(function(b) {
if (p.clearButton) {
p.clearButton.disabled = b;
}
if (p.storeButton) {
p.storeButton.textContent = b ? 'Store' : 'Overwrite';
}
});
if (p.doShowPopup) {
BV.popup({
target: pcWeb,
type: "ok",
message: [
"<b>Current state</b> of your image is stored in this browser. It will be loaded again upon reopening Kleki with this browser on this device.",
'',
'<b>Important:</b>',
'- Browser may delete it, depending on',
'&nbsp;&nbsp;disk space and settings',
'- Stores 1 image at a time',
'- Use <i>Save</i> for permanent storage'
].join('<br>'),
buttons: ["Ok"],
callback: function (result) {
}
});
} else {
output.out('Stored to Browser Storage.');
}
}, function(errorStr) {
if (p.storeButton) {
p.storeButton.disabled = false;
p.storeButton.textContent = 'Store';
}
setTimeout(function() {
throw 'storeKlekiProjectObj error, ' + errorStr;
})
BV.popup({
target: pcWeb,
type: "error",
message: "Failed to store. Your browser might not support this feature.",
buttons: ["Ok"],
callback: function (result) {
}
});
BV.browserStorage.isEmpty(function(b) {
if (p.clearButton) {
p.clearButton.disabled = b;
}
if (p.storeButton) {
p.storeButton.textContent = b ? 'Store' : 'Overwrite';
}
});
});
}
pcCanvas.getKlekiProjectObj(store, function(errorStr) {
if (p.storeButton) {
p.storeButton.disabled = false;
p.storeButton.textContent = 'Store';
}
BV.popup({
target: pcWeb,
type: "error",
message: "Failed to store. Your browser might not support this feature.",
buttons: ["Ok"],
callback: function (result) {
}
});
setTimeout(function() {
throw 'PcCanvas.getKlekiProjectObj error, ' + errorStr;
}, 0);
});
}

function saveImageToComputer() {

resetSaveReminder();


function saveImage(canvas, filename, mimeType) {
var parts = canvas.toDataURL(mimeType).match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

var binStr = atob(parts[3]);

var buf = new ArrayBuffer(binStr.length);
var view = new Uint8Array(buf);
for (var i = 0; i < view.length; i++) {
view[i] = binStr.charCodeAt(i);
}
var blob = new Blob([view], {'type': parts[1]});
saveAs(blob, filename);
}

if (exportType === 'png') {
let extension = 'png';
let mimeType = 'image/png';
let filename = BV.getDate() + "Kleki." + extension;
let fullCanvas = pcCanvas.getCompleteCanvas(1);

/*fullCanvas.toBlob(function(blob) {
if(blob === null) {
throw 'save image error, blob is null';
}
saveAs(blob, filename);
}, mimetype);*/



try {
saveImage(fullCanvas, filename, mimeType);
} catch (error) {
var im = new Image();
im.width = pcCanvas.getWidth();
im.height = pcCanvas.getHeight();
im.src = fullCanvas.toDataURL(mimeType);
BV.exportDialog(pcWeb, im);
}
} else if (exportType === 'layers') {
let extension = 'png';
let mimeType = 'image/png';
let fileBase = BV.getDate() + "Kleki";
let layerArr = pcCanvas.getLayersFast();
for (let i = 0; i < layerArr.length; i++) {
let item = layerArr[i];
let fnameArr = [
fileBase,
'_',
('' + (i + 1)).padStart(2, '0'),
'_',
item.name,
'.',
extension
];
saveImage(item.canvas, fnameArr.join(''), mimeType);
}
} else if (exportType === 'psd') {

let layerArr = pcCanvas.getLayersFast();

let psdConfig = {
width: pcCanvas.getWidth(),
height: pcCanvas.getHeight(),
children: [],
canvas: pcCanvas.getCompleteCanvas(1)
};
for (let i = 0; i < layerArr.length; i++) {
let item = layerArr[i];
psdConfig.children.push({
name: item.name,
opacity: item.opacity,
canvas: item.canvas,
blendMode: BV.PSD.blendKlekiToPsd(item.mixModeStr),
left: 0,
top: 0
});
}
let buffer = agPsd.writePsdBuffer(psdConfig);
let blob = new Blob([buffer], { type: 'application/octet-stream' });
saveAs(blob, BV.getDate() + 'Kleki.psd');

}

}


var bottomBar = new BV.BottomBar({
feedbackDialog: function () {
showFeedbackDialog(pcWeb);
},
showHelp: function () {
showIframePopup('./help/', pcWeb);
},
showChangelog: function () {
showIframePopup('./changelog/', pcWeb);
},
onSwap: function() {
uiState = uiState === 'left' ? 'right' : 'left';
localStorage.setItem('uiState', uiState);
updateUi();
}
});

toolspace.appendChild(layerPreview.getElement());
toolspace.appendChild(mainTabRow.getElement());

toolspace.appendChild(brushDiv);
toolspace.appendChild(handUi.getElement());
toolspace.appendChild(fillUi.getElement());
toolspace.appendChild(textUi.getElement());
toolspace.appendChild(shapeUi.getElement());
toolspace.appendChild(layerManager);
toolspace.appendChild(filterDiv);
toolspace.appendChild(fileDiv);
toolspace.appendChild(bottomBar.getDiv());




var logoLarge = true;
div.resize = function (p_w, p_h) {
let logoButtonHeight = 36;


width = Math.max(0, p_w);
height = Math.max(0, p_h);

updateCollapse();

var threshold = 617;
bottomBar.setIsVisible(height >= threshold);
layerPreview.setIsVisible(height >= 579);
pcColorSlider.setHeight(Math.max(163, Math.min(400, height - 505)));
toolspaceToolRow.setIsSmall(height < 540);

};


div.showMessage = function(msg) {
output.out(msg);
};


div.resize(width, height);
updateUi();

return div;
}


function showIframePopup(url, target) {
if (window.innerHeight < 500 || window.innerWidth < 700) {
window.open(url);
return;
}

let iframe = BV.el({
tagName: 'iframe',
custom: {
src: url,
},
css: {
width: '100%',
height: '100%'
}
});
let titleEl = BV.el({});
let linkEl = BV.el({
tagName: 'a',
parent: titleEl,
content: 'Open in new tab',
custom: {
href: 'help',
target: '_blank',
},
onClick: function() {
popup.close();
}
});
iframe.onload = function() {
BV.setAttributes(linkEl, {
href: iframe.contentWindow.location
});
};


let popup = new BV.Popup({
title: titleEl,
content: iframe,
width: 880,
isMaxHeight: true
});

}


var showFeedbackDialog = function (target) {
"use strict";
var div = document.createElement("div");
div.style.width = (7 * boxSize) + "px";
var descr = document.createElement("div");
descr.innerHTML = "Problem reports, feature ideas, and general comments are welcome.<br><b>Note:</b> <a href='./help/' target='_blank'>Help</a> might already address your problem.";

var boxSize = 50;
var inputDescription = document.createElement("textarea");
inputDescription.className = "kleki-textarea";
inputDescription.placeholder = "Your feedback...";
BV.css(inputDescription, {
resize: "none",
width: "100%",
height: "100%",
marginBottom: boxSize / 4.0 + "px"
});
BV.css(div, {
fontSize: (boxSize / 3.0) + "px"
});

var inputWrapper = document.createElement("div");
BV.css(inputWrapper, {
width: "100%",
height: (boxSize * 4) + "px",
paddingBottom: boxSize / 4.0 + "px",
marginTop: '10px',
boxSizing: "border-box"
});
inputWrapper.appendChild(inputDescription);

var emailInput = document.createElement("input");
var emailCaption = document.createElement("div");
emailInput.className = "kleki-input";
emailCaption.innerHTML = "(Optional) If you need a reply:<br/>";
emailInput.placeholder = "Your e-mail (optional) ...";
BV.css(emailInput, {
resize: "none",
width: "100%"
});


let messageInfoEl = document.createElement('a');
messageInfoEl.style.display = 'inline-block';
messageInfoEl.style.marginTop = '10px';
messageInfoEl.textContent = 'What does get sent?';
messageInfoEl.onclick = function() {
let contentArr = [
'The following text gets sent upon pressing Submit:',
'message: ' + inputDescription.value,
'',
'e-mail: ' + emailInput.value,
'',
'kleki version: ' + KLEKI.version,
'',
'user agent: ' + navigator.userAgent,
'',
'version hash: ' + KLEKI.versionHash,
];
alert(contentArr.join("\n"));
};

div.appendChild(descr);
div.appendChild(inputWrapper);
div.appendChild(emailCaption);
div.appendChild(emailInput);
div.appendChild(messageInfoEl);

inputDescription.onclick = function () {
inputDescription.focus();
};

function sendFeedback(msgStr, mailStr, versionStr, debugStr) {
var xmlhttp, response;
xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
var response;
if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
alert("Success. Thank you very much for your feedback.");
}
};

function replaceAt(str, index, character) {
return str.substr(0, index) + character + str.substr(index + character.length);
}

let formData = new FormData();
formData.append('msg', msgStr);
formData.append('version', versionStr);
formData.append('email', mailStr);
formData.append('debug', debugStr);

var fb = "mendFeedb";
xmlhttp.open("POST", replaceAt(fb, 0, "s") + "ack.php", true);
xmlhttp.send(formData);
}

setTimeout(function () {
inputDescription.focus();
}, 10);
BV.popup({
target: target,
title: "Send Feedback",
message: "<b>Send Feedback</b>",
div: div,
buttons: ["Submit", "Cancel"],
callback: function (val) {

if (val === "Submit") {
if (inputDescription.value != "") {
sendFeedback(inputDescription.value, emailInput.value, KLEKI.version, KLEKI.versionHash);
}
} else if (val === "Cancel") {
}
}
});
};

var pcWeb;
var additionalResizeCallback = function () {
};

(function() {



function onKlekiProjectObjLoaded(klekiProjectObj) {
if(KLEKI.isInitialized) {
throw 'onKlekiProjectObjLoaded called more than once';
}
let loadingScreenEl = document.getElementById("loading-screen");
loadingScreenEl.parentNode.removeChild(loadingScreenEl);
loadingScreenEl = null;


pcWeb = new PCWeb(window.innerWidth, window.innerHeight, klekiProjectObj);

BV.addEventListener(window, 'resize', function () {
pcWeb.resize(window.innerWidth, window.innerHeight);
additionalResizeCallback();
});
BV.addEventListener(window, 'orientationchange', function () {
pcWeb.resize(window.innerWidth, window.innerHeight);
additionalResizeCallback();
});

BV.addEventListener(pcWeb, 'wheel', function(event) {
event.preventDefault();
});

function prevent(e) {
e.preventDefault();
};
window.addEventListener('gesturestart', prevent);
window.addEventListener('gesturechange', prevent);
window.addEventListener('gestureend', prevent);
document.body.appendChild(pcWeb);

klekiProjectObj = null;
KLEKI.isInitialized = true;
KLEKI.onInit();
}

function onDomLoaded() {
if (pcWeb) {
return;
}
BV.browserStorage.getKlekiProjectObj(function(klekiProjectObj) {
onKlekiProjectObjLoaded(klekiProjectObj);
}, function(errorStr) {
onKlekiProjectObjLoaded(null);
setTimeout(function() {
pcWeb.showMessage('Failed to restore from Browser Storage');
throw 'getKlekiProjectObj() error, ' + errorStr;
}, 100);
});
}

BV.addEventListener(window, 'DOMContentLoaded', function () {
setTimeout(onDomLoaded, 10);
});

})();





var oldActionNumber = BV.pcLog.getActionNumber();
var remindersShowed = 0;
setInterval(function () {
if (document.visibilityState !== 'visible') {
return;
}

var reminderTimelimitMs = 1000 * 60 * 20;

let actionNumber = BV.pcLog.getActionNumber();

var loggerDist = actionNumber[0] !== oldActionNumber[0] ? actionNumber[1] : Math.abs(actionNumber[1] - oldActionNumber[1]);

if(KLEKI.lastReminderResetAt + reminderTimelimitMs < (performance.now()) && loggerDist >= 30) {
resetSaveReminder(true);
BV.showSaveReminderToast(remindersShowed++);
}
}, 1000 * 60);

function resetSaveReminder(isSoft) {
if (!isSoft) {
remindersShowed = 0;
}
KLEKI.lastReminderResetAt = performance.now();
oldActionNumber = BV.pcLog.getActionNumber();
BV.setEventListener(window, 'onbeforeunload', null);
}


function onBeforeUnload(e) {
e.preventDefault();
e.returnValue = '';
}

BV.pcLog.addListener(function() {
let actionNumber = BV.pcLog.getActionNumber();
if(0 !== actionNumber && oldActionNumber.join('.') !== actionNumber.join('.')) {
BV.setEventListener(window, 'onbeforeunload', onBeforeUnload);
} else {
BV.setEventListener(window, 'onbeforeunload', null);
}
});

(function() {
/* more accurate visiting-duration */
setInterval(function() {
if(document.visibilityState === 'visible') {
gtag('event', 'is_alive ' + KLEKI.version + ' ' + KLEKI.versionHash, {
event_category: 'Alive'
});
}
}, 1000 * 60 * 5);


let isIframe = false;
try {
isIframe =  window.self !== window.top;
} catch (e) {
isIframe = true;
}
if (isIframe) {
gtag('event', 'is_iframe', {
event_category: 'Iframe'
});
}

})();

})();
