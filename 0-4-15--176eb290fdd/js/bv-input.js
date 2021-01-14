(function () {
"use strict";

BV.mouseEventHasMovement = function () {




if (!('MouseEvent' in window)) {
return false;
}
let mouseEvent;
try {
mouseEvent = new MouseEvent('mousemove');
} catch (e) {
return false;
}
if (!('movementX' in mouseEvent)) {
return false;
}
return !BV.isFirefox();
};

BV.hasPointerEvents = function () {
return !!window.PointerEvent;
};

(function () {

let hasPointerEvents = BV.hasPointerEvents();
let listenerFuncObj = {};

BV.setEventListener = function (DomEl, type, listener) {
if (!hasPointerEvents) {
type = type.replace('pointer', 'mouse');
}
DomEl[type] = listener;
};

BV.addEventListener = function (DomEl, type, listener, options) {
if (!hasPointerEvents) {
type = type.replace('pointer', 'mouse');
}
if (!(type in listenerFuncObj)) {
listenerFuncObj[type] = [];
}
listenerFuncObj[type].push(listener);
DomEl.addEventListener(type, listener, options);
};

BV.removeEventListener = function (DomEl, type, listener, options) {
if (!hasPointerEvents) {
type = type.replace('pointer', 'mouse');
}
if (type in listenerFuncObj) {
for (let i = 0; i < listenerFuncObj[type].length; i++) {
if (listenerFuncObj[type][i] === listener) {
listenerFuncObj[type].splice(i, 1);
i--;
}
}
}
DomEl.removeEventListener(type, listener, options);
};











})();


/**
* Listens to key events in window. Makes combos easier - e.g. ctrl + z
*
* p = {
*     onDown: function(keyStr, KeyEvent, comboStr, isRepeat),
*     onUp: function(keyStr, KeyEvent, oldComboStr),
*     onBlur: function(),
* }
*
* keyStr - see in implementation - my representation of a key. e.g. 'r' can be 'r' and 'R'
* comboStr - string joins currently pressed keyStr with a +
*              e.g. 'ctrl+z'
*
* todo only use one set of listeners globally - will be more accurate too
*
* @param p
* @constructor
*/
BV.KeyListener = function (p) {

let keyStrToKeyObj = {
'space': [' ', 'Spacebar'],
'alt': ['Alt', 'AltGraph'],
'shift': 'Shift',
'ctrl': 'Control',
'cmd': ['Meta', 'MetaLeft', 'MetaRight'],
'enter': 'Enter',
'esc': 'Escape',
'backspace': 'Backspace',
'delete': 'Delete',
'sqbr_open': '[',
'sqbr_close': ']',
'a': ['a', 'A'],
'b': ['b', 'B'],
'c': ['c', 'C'],
'e': ['e', 'E'],
'f': ['f', 'F'],
'g': ['g', 'G'],
'r': ['r', 'R'],
's': ['s', 'S'],
't': ['t', 'T'],
'u': ['u', 'U'],
'x': ['x', 'X'],
'y': ['y', 'Y'],
'z': ['z', 'Z'],
'plus': '+',
'minus': '-',
'left': 'ArrowLeft',
'right': 'ArrowRight',
'up': 'ArrowUp',
'down': 'ArrowDown',
'home': 'Home',
'end': 'End'
};
let keyToKeyStrArr = Object.keys(keyStrToKeyObj);
let isDownObj = {};
let keyToKeyStrObj = {};
for (let i = 0; i < keyToKeyStrArr.length; i++) {
isDownObj[keyToKeyStrArr[i]] = false;

let code = keyStrToKeyObj[keyToKeyStrArr[i]];
if (typeof code === 'string') {
keyToKeyStrObj[keyStrToKeyObj[keyToKeyStrArr[i]]] = keyToKeyStrArr[i];
} else {
for (let e = 0; e < code.length; e++) {
keyToKeyStrObj[code[e]] = keyToKeyStrArr[i];
}
}
}
let comboArr = [];


let codeIsDownObj = {};

function keyDown(e) {
let key = e.key;
let code = 'code' in e ? e.code : e.keyCode;

if (key in keyToKeyStrObj) {
let keyStr = keyToKeyStrObj[key];
if (isDownObj[keyStr]) {
if (p && 'onDown' in p) {
p.onDown(keyStr, e, comboArr.join('+'), true);
}
return;
}
isDownObj[keyStr] = true;
codeIsDownObj[code] = keyStr;


comboArr.push(keyStr);

if (p && 'onDown' in p) {
p.onDown(keyStr, e, comboArr.join('+'));
}
}
}

function keyUp(e) {
let key = e.key;
let code = 'code' in e ? e.code : e.keyCode;
let oldComboStr = comboArr.join('+');


if (['Meta', 'MetaLeft'].includes(code)) {
blur(null);
return;
}

if (code in codeIsDownObj && codeIsDownObj[code] !== null) {
let keyStr = codeIsDownObj[code];
isDownObj[keyStr] = false;
codeIsDownObj[code] = null;


for (let i = 0; i < comboArr.length; i++) {
if (comboArr[i] == keyStr) {
comboArr.splice(i, 1);
i--;
}
}

if (p && 'onUp' in p) {
p.onUp(keyStr, e, oldComboStr);
}
}
}

function blur(event) {
let oldComboStr = comboArr.join('+');
comboArr = [];
codeIsDownObj = {};

let eventArr = [];
for (let i = 0; i < keyToKeyStrArr.length; i++) {
isDownObj[keyToKeyStrArr[i]] = false;
eventArr.push(keyToKeyStrArr[i]);
}
if (p && 'onUp' in p) {
for (let i = 0; i < eventArr.length; i++) {
p.onUp(eventArr[i], {
preventDefault: function () {
}, stopPropagation: function () {
}
}, oldComboStr);
}
}

if (p && p.onBlur) {
p.onBlur();
}
}

BV.addEventListener(document, 'keydown', keyDown);
BV.addEventListener(document, 'keyup', keyUp);
BV.addEventListener(window, 'blur', blur);




this.isPressed = function (keyStr) {
if (!(keyStr in isDownObj)) {
throw 'key "' + keyStr + '" not found';
}
return isDownObj[keyStr];
};

this.getComboStr = function () {
return comboArr.join('+');
};

this.comboOnlyContains = function (keyStrArr) {
for (let i = 0; i < comboArr.length; i++) {
if (!keyStrArr.includes(comboArr[i])) {
return false;
}
}
return true;
};

this.destroy = function () {
BV.removeEventListener(document, 'keydown', keyDown);
BV.removeEventListener(document, 'keyup', keyUp);
BV.removeEventListener(window, 'blur', blur);
};

};


/**
* Filters wheel events. removes swipe scrolling and pinch scrolling that trackpads do. (as best as it can)
* Normalizes regular scrolls.
*
* Why:
* - trackpad scrolling is different from old school mouse scrolling
* - but there is not way to learn from the browser if it's trackpad scrolling
* - browsers don't even give access to the raw swiping or pinching movement, but some abstraction on top, making the scrolling
*      continue an arbitrary amount, at an arbitrary scale
* - each browser does this differently. So you can't offer a coherent experience
*
* - also trackpads are painful to draw with. So supporting a trackpad-based workflow makes not much sense.
*
* @param callback - func({deltaY: number, pageX: number, pageY: number}
* @constructor
*/
BV.WheelCleaner = function (callback) {
const sequenceTimeoutMs = 200;

let knownUnitArr = [100];
let sequenceLength = 0;
let sequenceUnit = null;
let endSequenceTimeout;
let toEmitDelta = null;
let position = null;


function emit(delta) {
callback({
deltaY: Math.round(delta / sequenceUnit),
pageX: position.pageX,
pageY: position.pageY
});
}

function endSequence() {
if (toEmitDelta !== null) {
emit(toEmitDelta);
toEmitDelta = null;
}
if (sequenceUnit !== null && !(knownUnitArr.includes(sequenceUnit))) {
knownUnitArr.push(sequenceUnit);
}
sequenceLength = 0;
sequenceUnit = null;
}


this.process = function (event) {

position = {
pageX: event.pageX,
pageY: event.pageY,
};

clearTimeout(endSequenceTimeout);
endSequenceTimeout = setTimeout(endSequence, sequenceTimeoutMs);


let delta = event.deltaY;
if ('deltaMode' in event && event.deltaMode === 1) {
delta *= 100 / 3;
}
let absDelta = Math.abs(delta);


if (sequenceLength > 0 && sequenceUnit === null) {

toEmitDelta = null;
return;
}


if (sequenceLength === 0) {
sequenceLength++;
if (absDelta < 50) {

return;
}

sequenceUnit = absDelta;
if (knownUnitArr.includes(sequenceUnit)) {

emit(delta);
} else {

toEmitDelta = delta;
}
return;
}


if (absDelta === 0) {

return;
}
if (
absDelta === sequenceUnit ||
(absDelta / sequenceUnit) % 1 < 0.0001// a multiple
) {

} else if ((sequenceUnit / absDelta) % 1 < 0.0001) {

sequenceUnit = absDelta;

} else if (absDelta !== sequenceUnit) {

sequenceUnit = null;
toEmitDelta = null;
return;
}


if (toEmitDelta !== null) {
emit(toEmitDelta);
toEmitDelta = null;
}
emit(delta);
};
};


/**
* PointerListener - for pointer events, wheel events. uses fallbacks. ideally consistent behavior across browsers
* Has some workarounds for browser specific bugs. As browsers get better, this constructor should get smaller
*
* p = {
*     target: DOM element,
*     onPointer: func (pointerEvent),
*     onWheel: func (wheelEvent),
*     onEnterLeave: func (isOver: boolean),
*     maxPointers: int (1 - n)
* }
*
* pointerEvent = {
*     type: 'pointerdown'|'pointermove'|'pointerup',
*     pointerId: long,
*     pointerType: 'touch'|'mouse'|'pen',
*     pageX: number,
*     pageY: number,
*     relX: number,
*     relY: number,
*     dX: number,
*     dY: number,
*     downPageX: number,
*     downPageY: number,
*     coalescedArr: Array of {
*         pageX: number,
*         pageY: number,
*         relX: number,
*         relY: number,
*         dX: number,
*         dY: number,
*         time: number// same timescale as performance.now() - might be exact same number as in parent
*     },
*     time: number,
*     button: 'left'|'middle'|'right',
*     pressure: number (0-1),
*     eventPreventDefault: function(),
*     eventStopPropagation: function(),
* }
*
* wheelEvent = {
*     deltaY: number,
*     pageX: number,
*     pageY: number,
*     relX: number,
*     relY: number
* }
*
* isOver(): boolean - if pointer over the target
*
* @param p
*/
BV.PointerListener = (function () {


let pointerArr = [];

function addPointer(event) {
let pointerObj = {
pointerId: event.pointerId,
lastPageX: null,
lastPageY: null
};
pointerArr.push(pointerObj);

if (pointerArr.length > 15) {
pointerArr.shift();
}

return pointerObj;
}

function getPointer(event) {
for (let i = pointerArr.length - 1; i >= 0; i--) {
if (event.pointerId === pointerArr[i].pointerId) {
return pointerArr[i];
}
}
return null;
}


let pressureNormalizeAvgCount = 0;
let pressureNormalizeAvgPressure = null;
let pressureNormalizeIsComplete = false;
let pressureNormalizeFactor = 1;

return function (p) {
const targetElement = p.target;
const onPointerCallback = p.onPointer;
const onWheelCallback = p.onWheel;
const onEnterLeaveCallback = p.onEnterLeave;
const maxPointers = 'maxPointers' in p ? p.maxPointers : 1;
const hasPointerEvents = BV.hasPointerEvents();
const mouseEventHasMovement = BV.mouseEventHasMovement();
const isFirefox = BV.isFirefox();
const buttonsToStr = {
'1': 'left',
'2': 'right',
'4': 'middle'
};
const wheelCleaner = new BV.WheelCleaner(function (wheelEvent) {
if (isDestroyed) {
return;
}
if (onWheelCallback) {
updateOffset();
wheelEvent.relX = wheelEvent.pageX - offsetObj.x;
wheelEvent.relY = wheelEvent.pageY - offsetObj.y;
onWheelCallback(wheelEvent);
}
});
let isDestroyed = false;

let offsetObj = {x: 0, y: 0};

function updateOffset() {
if (targetElement === window) {
return;
}
offsetObj = BV.getPageOffset(targetElement);
}

updateOffset();
let timeStampOffset = BV.eventUsesHighResTimeStamp() ? 0 : -performance.timing.navigationStart;



let lastPointerType = '';
let didSkip = false;


/*
pointers that are pressing a button
dragObj = {
pointerId: long,
pointerType: 'mouse'|'pen'|'touch',
downPageX: number,
downPageY: number,
button: long,
lastPageX: number,
lastPageY: number,
lastTimeStamp: number
}
*/
let dragObjArr = [];
let dragPointerIdArr = [];

function getDragObj(pointerId) {
for (let i = 0; i < dragObjArr.length; i++) {
if (pointerId === dragObjArr[i].pointerId) {
return dragObjArr[i];
}
}
return null;
}

function removeDragObj(pointerId) {
let removedDragObj = null;
for (let i = 0; i < dragPointerIdArr.length; i++) {
if (dragPointerIdArr[i] === pointerId) {
removedDragObj = dragObjArr[i];
dragObjArr.splice(i, 1);
dragPointerIdArr.splice(i, 1);
i--;
}
}
return removedDragObj;
}


function normalizePressure(pressure, type) {
if (pressure === 0 || pressure === 1) {
return pressure;
}


/*if (pressureNormalizeIsComplete && type === 'pointerdown' && pressure !== 1) {
pressure *= 0.004;
}*/

if (pressureNormalizeAvgCount < 60) {
if (pressureNormalizeAvgCount === 0) {
pressureNormalizeAvgPressure = pressure;
} else {
pressureNormalizeAvgPressure = BV.mix(pressure, pressureNormalizeAvgPressure, 0.95);
}
pressureNormalizeAvgCount++;
} else if (!pressureNormalizeIsComplete) {
pressureNormalizeIsComplete = true;

if (pressureNormalizeAvgPressure < 0.13) {
pressureNormalizeFactor = 2.3;
}
}


return Math.pow(pressure, 1 / pressureNormalizeFactor);
}


/**
*
* More trustworthy pointer attributes. that behave the same across browsers.
* returns a new object. this object also gets attached to the orig event. -> event.corrected
*
* @param event
* @returns {{pointerId: number, timeStamp: number, button, buttons, pointerType: (string|string|any), movementY: number, movementX: number, pressure, coalescedArr: [], pageY, pageX, eventPreventDefault: func, eventStopPropagation: func}
*/
function correctPointerEvent(event) {
if (event.corrected) {
return event.corrected;
}

/*if(event.type === 'pointermove' && !window.hidePressureOut) {
if(event.type === 'pointermove') {
BV.throwOut(event.pressure + ' ' + event.pointerType);
}
}*/

let correctedObj = {
pointerId: event.pointerId,
pointerType: event.pointerType,
pageX: event.pageX,
pageY: event.pageY,
movementX: event.movementX,
movementY: event.movementY,
timeStamp: event.timeStamp + timeStampOffset,
pressure: normalizePressure(event.pressure, event.type),
buttons: event.buttons,
button: event.button,
coalescedArr: [],
eventPreventDefault: function () {
event.preventDefault();
},
eventStopPropagation: function () {
event.stopPropagation();
}
};
event.corrected = correctedObj;

let customPressure = null;
if ('pointerId' in event) {
if (isFirefox) {
correctedObj.pressure = 1;
customPressure = 1;

} else if ('pressure' in event && event.buttons !== 0 && (['mouse'].includes(event.pointerType) || (event.pointerType === 'touch' && event.pressure === 0))) {
correctedObj.pressure = 1;
customPressure = 1;
}
} else {
correctedObj.pointerId = 0;
correctedObj.pointerType = 'mouse';
correctedObj.pressure = event.buttons !== 0 ? 1 : 0;
customPressure = correctedObj.pressure;
}

if (isFirefox && event.pointerType != 'mouse' && event.type === 'pointermove' && event.buttons === 0) {
correctedObj.buttons = 1;
}

let coalescedEventArr = [];
if ('getCoalescedEvents' in event) {
coalescedEventArr = event.getCoalescedEvents();
}




let pointerObj = getPointer(correctedObj);
if (pointerObj === null) {
pointerObj = addPointer(correctedObj);
}

let totalLastX = pointerObj.lastPageX;
let totalLastY = pointerObj.lastPageY;

for (let i = 0; i < coalescedEventArr.length; i++) {
let eventItem = coalescedEventArr[i];

correctedObj.coalescedArr.push({
pageX: eventItem.pageX,
pageY: eventItem.pageY,
movementX: pointerObj.lastPageX === null ? 0 : eventItem.pageX - pointerObj.lastPageX,
movementY: pointerObj.lastPageY === null ? 0 : eventItem.pageY - pointerObj.lastPageY,
timeStamp: eventItem.timeStamp === 0 ? correctedObj.timeStamp : (eventItem.timeStamp + timeStampOffset),
pressure: customPressure === null ? normalizePressure(eventItem.pressure) : customPressure
});

pointerObj.lastPageX = eventItem.pageX;
pointerObj.lastPageY = eventItem.pageY;
}

pointerObj.lastPageX = correctedObj.pageX;
pointerObj.lastPageY = correctedObj.pageY;
correctedObj.movementX = totalLastX === null ? 0 : pointerObj.lastPageX - totalLastX;
correctedObj.movementY = totalLastY === null ? 0 : pointerObj.lastPageY - totalLastY;

return correctedObj;

}

/**
* creates a value for onPointer, from a pointer event handler
*
* @param typeStr string - 'pointerdown'|'pointermove'|'pointerup'
* @param correctedEvent - corrected pointer event from correctPointerEvent()
* @param custom - object for setting custom attributes
* @returns {{pointerId: number, pointerType: *, dX: (*), relY: number, dY: (*), relX: number, type: *, event: *, pageY: *, pageX: *}}
*/
function createPointerOutEvent(typeStr, correctedEvent, custom) {
let result = {
type: typeStr,
pointerId: correctedEvent.pointerId,
pointerType: correctedEvent.pointerType,
pageX: correctedEvent.pageX,
pageY: correctedEvent.pageY,
relX: correctedEvent.pageX - offsetObj.x,
relY: correctedEvent.pageY - offsetObj.y,
dX: correctedEvent.movementX,
dY: correctedEvent.movementY,
time: correctedEvent.timeStamp,
eventPreventDefault: correctedEvent.eventPreventDefault,
eventStopPropagation: correctedEvent.eventStopPropagation
};

if (typeStr === 'pointermove') {
result.coalescedArr = [];
if (correctedEvent.coalescedArr.length > 1) {
let coalescedItem;
for (let i = 0; i < correctedEvent.coalescedArr.length; i++) {
coalescedItem = correctedEvent.coalescedArr[i];
result.coalescedArr.push({
pageX: coalescedItem.pageX,
pageY: coalescedItem.pageY,
relX: coalescedItem.pageX - offsetObj.x,
relY: coalescedItem.pageY - offsetObj.y,
dX: coalescedItem.movementX,
dY: coalescedItem.movementY,
time: coalescedItem.timeStamp
});
}
}
}

if (custom) {
let keyArr = Object.keys(custom);
for (let i = 0; i < keyArr.length; i++) {
result[keyArr[i]] = custom[keyArr[i]];
}
}

return result;
}

/**
* creates a value for onPointer, from a fallback touch event handler
*
* @param typeStr string - 'pointerdown'|'pointermove'|'pointerup'
* @param touchListItem - element from changed touch list
* @param touchEvent - touch event
* @param custom - object for setting custom attributes
* @returns {{pointerId: number, pointerType: string, relY: number, relX: number, type: *, event: *, pageY: *, pageX: *}}
*/
function createTouchOutEvent(typeStr, touchListItem, touchEvent, custom) {
let result = {
type: typeStr,
pointerId: touchListItem.identifier,
pointerType: 'touch',
pageX: touchListItem.pageX,
pageY: touchListItem.pageY,
relX: touchListItem.pageX - offsetObj.x,
relY: touchListItem.pageY - offsetObj.y,
time: touchEvent.timeStamp + timeStampOffset,
eventPreventDefault: function() { touchEvent.preventDefault(); },
eventStopPropagation: function() { touchEvent.stopPropagation(); }
};

if (typeStr === 'pointermove') {
result.coalescedArr = [];
}

let keyArr = Object.keys(custom);
for (let i = 0; i < keyArr.length; i++) {
result[keyArr[i]] = custom[keyArr[i]];
}

return result;
}

function setupDocumentListeners() {
BV.addEventListener(document, 'pointermove', onGlobalPointerMove);
BV.addEventListener(document, 'pointerup', onGlobalPointerUp);
BV.addEventListener(document, 'pointerleave', onGlobalPointerLeave);
}

function destroyDocumentListeners() {
BV.removeEventListener(document, 'pointermove', onGlobalPointerMove);
BV.removeEventListener(document, 'pointerup', onGlobalPointerUp);
BV.removeEventListener(document, 'pointerleave', onGlobalPointerLeave);
}

let isOverCounter = 0;
function onPointerEnter() {
isOverCounter++;
if (onEnterLeaveCallback) {
onEnterLeaveCallback(true);
}
}

function onPointerLeave() {
isOverCounter--;
if (onEnterLeaveCallback) {
onEnterLeaveCallback(false);
}
}

function onPointermove(event) {
event = correctPointerEvent(event);

let tempLastPointerType = lastPointerType;
lastPointerType = event.pointerType;

if (dragPointerIdArr.includes(event.pointerId) || dragPointerIdArr.length === maxPointers || event.pointerType === 'touch') {
didSkip = false;
return;
}
updateOffset();


if (!didSkip && event.pointerType === 'mouse' && tempLastPointerType === 'pen') {
didSkip = true;
return;
}
didSkip = false;

let outEvent = createPointerOutEvent('pointermove', event);
onPointerCallback(outEvent);

}

function onPointerdown(event) {

event = correctPointerEvent(event);

if (dragPointerIdArr.includes(event.pointerId) || dragPointerIdArr.length === maxPointers || !([1, 2, 4].includes(event.buttons))) {

return;
}
updateOffset();



if (dragObjArr.length === 0) {
setupDocumentListeners();
}
let dragObj = {
pointerId: event.pointerId,
pointerType: event.pointerType,
downPageX: event.pageX,
downPageY: event.pageY,
buttons: event.buttons,
lastPageX: event.pageX,
lastPageY: event.pageY,
lastTimeStamp: event.timeStamp
};
dragObjArr.push(dragObj);
setTouchTimeout(dragObj);
dragPointerIdArr.push(event.pointerId);

let outEvent = createPointerOutEvent('pointerdown', event, {
downPageX: event.pageX,
downPageY: event.pageY,
button: buttonsToStr[event.buttons],
pressure: event.pressure
});

onPointerCallback(outEvent);
}


function onGlobalPointerMove(event) {

event = correctPointerEvent(event);

if (!(dragPointerIdArr.includes(event.pointerId))) {
return;
}
updateOffset();

let dragObj = getDragObj(event.pointerId);
clearTouchTimeout(dragObj);


if (event.buttons !== dragObj.buttons) {



if (dragObjArr.length === 1) {
destroyDocumentListeners();
}
removeDragObj(event.pointerId);

let outEvent = createPointerOutEvent('pointerup', event, {
downPageX: dragObj.downPageX,
downPageY: dragObj.downPageY
});
onPointerCallback(outEvent);
return;

}

setTouchTimeout(dragObj);


if (
event.pointerType === 'pen' &&
event.pageX === dragObj.lastPageX &&
event.pageY === dragObj.lastPageY &&
event.timeStamp === dragObj.lastTimeStamp
) {

return;
}

let outEvent = createPointerOutEvent('pointermove', event, {
downPageX: dragObj.downPageX,
downPageY: dragObj.downPageY,
button: buttonsToStr[event.buttons],
pressure: event.pressure
});

dragObj.lastPageX = event.pageX;
dragObj.lastPageY = event.pageY;
dragObj.lastTimeStamp = event.timeStamp;

onPointerCallback(outEvent);

}

function onGlobalPointerUp(event) {

event = correctPointerEvent(event);

if (!(dragPointerIdArr.includes(event.pointerId))) {
return;
}
updateOffset();


if (dragObjArr.length === 1) {
destroyDocumentListeners();
}
let dragObj = removeDragObj(event.pointerId);
clearTouchTimeout(dragObj);

let outEvent = createPointerOutEvent('pointerup', event, {
downPageX: dragObj.downPageX,
downPageY: dragObj.downPageY
});
onPointerCallback(outEvent);

}

function onGlobalPointerLeave(event) {

event = correctPointerEvent(event);

if (!(dragPointerIdArr.includes(event.pointerId))) {
return;
}
updateOffset();


if (dragObjArr.length === 1) {
destroyDocumentListeners();
}
let dragObj = removeDragObj(event.pointerId);
clearTouchTimeout(dragObj);

let outEvent = createPointerOutEvent('pointerup', event, {
downPageX: dragObj.downPageX,
downPageY: dragObj.downPageY
});
onPointerCallback(outEvent);
}


/*
--- ipad pointer event glitch damage control ---

ipad pointer events are glitchy. doesn't always fire pointerup.
- when two fingers get really close to each other
- when finger moves out and back in bottom

This artificially fires a pointerup
*/
function onTouchTimeout(dragObj) {


let fakeEvent = {
pointerId: dragObj.pointerId,
pointerType: dragObj.pointerType,
type: 'pointerup',
timeStamp: performance.now(),
pageX: 0,
pageY: 0,
preventDefault: function () {
},
stopPropagation: function () {
}
};


onGlobalPointerUp(fakeEvent);
}

function setTouchTimeout(dragObj) {
if (dragObj.pointerType !== 'touch') {
return;
}
dragObj.touchTimeout = setTimeout(function () {
onTouchTimeout(dragObj);
}, 2500);
}

function clearTouchTimeout(dragObj) {
if (!dragObj.touchTimeout) {
return;
}
clearTimeout(dragObj.touchTimeout);
dragObj.touchTimeout = null;
}


if (onEnterLeaveCallback) {
BV.addEventListener(targetElement, 'pointerenter', onPointerEnter);
BV.addEventListener(targetElement, 'pointerleave', onPointerLeave);
}
if (onPointerCallback) {
BV.addEventListener(targetElement, 'pointermove', onPointermove);
BV.addEventListener(targetElement, 'pointerdown', onPointerdown);
}
if (onWheelCallback) {
BV.addEventListener(targetElement, 'wheel', wheelCleaner.process);
}


let onTouchstart;
let onTouchmove;
let onTouchend;


if (!(BV.hasPointerEvents())) {

onTouchstart = function (event) {

event.preventDefault();
updateOffset();

let touchArr = event.changedTouches;
for (let i = 0; i < touchArr.length && dragObjArr.length < maxPointers; i++) {
let touchObj = touchArr[i];


if (dragObjArr.length === 0) {
BV.addEventListener(document, 'touchmove', onTouchmove);
BV.addEventListener(document, 'touchend', onTouchend);
BV.addEventListener(document, 'touchcancel', onTouchend);
}
dragObjArr.push({
pointerId: touchObj.identifier,
downPageX: touchObj.pageX,
downPageY: touchObj.pageY,
buttons: 1,
lastPageX: touchObj.pageX,
lastPageY: touchObj.pageY,
});
dragPointerIdArr.push(touchObj.identifier);

let outEvent = createTouchOutEvent('pointerdown', touchObj, event, {
dX: 0,
dY: 0,
downPageX: touchObj.downPageX,
downPageY: touchObj.downPageY,
button: 'left',
pressure: 1
});
onPointerCallback(outEvent);
}

}

onTouchmove = function (event) {
event.preventDefault();
updateOffset();


let touchArr = event.changedTouches;
for (let i = 0; i < touchArr.length; i++) {
let touchObj = touchArr[i];

if (!(dragPointerIdArr.includes(touchObj.identifier))) {
continue;
}
let dragObj = getDragObj(touchObj.identifier);

let outEvent = createTouchOutEvent('pointermove', touchObj, event, {
dX: touchObj.pageX - dragObj.lastPageX,
dY: touchObj.pageY - dragObj.lastPageY,
downPageX: dragObj.downPageX,
downPageY: dragObj.downPageY,
button: 'left',
isCoalesced: false,
pressure: 1
});
dragObj.lastPageX = touchObj.pageX;
dragObj.lastPageY = touchObj.pageY;
onPointerCallback(outEvent);

}

}

onTouchend = function (event) {
if (event.type !== 'touchcancel') {
event.preventDefault();
}
updateOffset();


let touchArr = event.changedTouches;
for (let i = 0; i < touchArr.length; i++) {
let touchObj = touchArr[i];

if (!(dragPointerIdArr.includes(touchObj.identifier))) {
continue;
}


if (dragObjArr.length === 1) {
BV.removeEventListener(document, 'touchmove', onTouchmove);
BV.removeEventListener(document, 'touchend', onTouchend);
BV.removeEventListener(document, 'touchcancel', onTouchend);
}
let dragObj = removeDragObj(touchObj.identifier);

let outEvent = createTouchOutEvent('pointerup', touchObj, event, {
dX: touchObj.pageX - dragObj.lastPageX,
dY: touchObj.pageY - dragObj.lastPageY,
downPageX: dragObj.downPageX,
downPageY: dragObj.downPageY,
});

onPointerCallback(outEvent);
}

}

if (onPointerCallback) {
BV.addEventListener(targetElement, 'touchstart', onTouchstart);
}

}




this.isOver = function () {
return isOverCounter > 0;
};

this.destroy = function () {
if (isDestroyed) {
return;
}
isDestroyed = true;
BV.removeEventListener(targetElement, 'pointerenter', onPointerEnter);
BV.removeEventListener(targetElement, 'pointerleave', onPointerLeave);
BV.removeEventListener(targetElement, 'pointermove', onPointermove);
BV.removeEventListener(targetElement, 'pointerdown', onPointerdown);
BV.removeEventListener(targetElement, 'wheel', wheelCleaner.process);
if (dragObjArr.length > 0) {
destroyDocumentListeners();
}

if (!(BV.hasPointerEvents())) {
BV.removeEventListener(targetElement, 'touchstart', onTouchstart);
if (dragObjArr.length > 0) {
BV.removeEventListener(document, 'touchmove', onTouchmove);
BV.removeEventListener(document, 'touchend', onTouchend);
BV.removeEventListener(document, 'touchcancel', onTouchend);
}
}
};

}
})();


BV.EventChain = {};
/**
* for chaining event processing. useful for gestures (double tap, pinch zoom, max pointer filter).
* each element in the chain might hold back the events, swallow them, or transform them
*
* p = {
*     chainArr: ChainElement[]
* }
*
* chainIn(event): null - feed an event into the chain
* setChainOut(func): void - func(event) <- called when passed through chain
* ^ each ChainElement needs these methods too
*
* @param p
* @constructor
*/
BV.EventChain.EventChain = function (p) {

let chainArr = p.chainArr;
let chainOut = function () {
};

function continueChain(i, event) {
for (; i < chainArr.length; i++) {
event = chainArr[i].chainIn(event);
if (event === null) {
return null;
}
}
chainOut(event);
return null;
}

for (let i = 0; i < chainArr.length; i++) {
(function (i) {
chainArr[i].setChainOut(function (event) {
continueChain(i + 1, event);
});
})(i);
}



this.chainIn = function (event) {
return continueChain(0, event);
};
this.setChainOut = function (func) {
chainOut = func;
};
};


/**
* A ChainElement. Detects double taps.
*
* p = {
*     onDoubleTap: function({pageX: number, pageY: number}) - fires when double tap occurs
* }
*
* chainIn
* setChainOut
* setAllowedPointerTypeArr(string[]): void - which pointer types are allowed
* setAllowedButtonArr(string[]): void - which buttons are allowed
*
* @param p
* @constructor
*/
BV.EventChain.DoubleTapper = function (p) {

let chainOut = function () {
};
const minSilenceBeforeDurationMs = 400;
const maxPressedDurationMs = 300;
const maxPressedDistancePx = 10;
const maxInbetweenDistancePx = 19;
const maxUpToUpDurationMs = 500;
const maxUntilSecondDownDurationMs = 300;
const minSilenceAfterMs = 250;

let allowedPointerTypeArr = ['touch', 'mouse', 'pen'];
let allowedButtonArr = ['left'];

let sequenceArr = [];
let pointersDownIdArr = [];
let lastUpTime = 0;
let nowTime = 0;

let eventQueueArr = [];


function fail() {
if (sequenceArr.length === 0) {
return;
}
clearTimeout(timeoutObj.fail);
clearTimeout(timeoutObj.maxUntilSecondDown);
clearTimeout(timeoutObj.success);
timeoutObj.fail = null;
timeoutObj.maxUntilSecondDown = null;
timeoutObj.success = null;


for (let i = 0; i < eventQueueArr.length; i++) {
chainOut(eventQueueArr[i]);
}
eventQueueArr = [];

sequenceArr = [];
}


function success() {
timeoutObj.fail = null;
timeoutObj.success = null;
eventQueueArr = [];
let lastSequenceItem = sequenceArr[sequenceArr.length - 1];
sequenceArr = [];
p.onDoubleTap({pageX: lastSequenceItem.pageX, pageY: lastSequenceItem.pageY});
}


let timeoutObj = {
fail: null,
maxUntilSecondDown: null,
success: null
};


function setupTimeout(timeoutStr, targetFunc, timeMS) {
let diff = timeMS - nowTime;

if (diff <= 0) {
return false;
}
timeoutObj[timeoutStr] = setTimeout(targetFunc, diff);
return true;
}


/**
* @param event object - a pointer event from BV.PointerListener
*/
function processEvent(event) {

if (event.type === 'pointerdown') {
pointersDownIdArr.push(event.pointerId);
} else if (event.type === 'pointerup') {
for (let i = 0; i < pointersDownIdArr.length; i++) {
if (pointersDownIdArr[i] === event.pointerId) {
pointersDownIdArr.splice(i, 1);
break;
}
}
}

if (!allowedPointerTypeArr.includes(event.pointerType)) {

fail();
return;
}

nowTime = performance.now();
let lastSequenceItem = sequenceArr.length > 0 ? sequenceArr[sequenceArr.length - 1] : null;
if (event.type === 'pointerup') {
lastUpTime = event.time;
}

if (event.type === 'pointerdown') {
if (pointersDownIdArr.length > 1) {

fail();
return;
}
if (timeoutObj.success !== null) {

fail();
return;
}
if (sequenceArr.length === 0 && nowTime - lastUpTime < minSilenceBeforeDurationMs) {

fail();
return;
}
if (!allowedButtonArr.includes(event.button)) {

fail();
return;
}
if (lastSequenceItem && lastSequenceItem.isDown || sequenceArr.length > 2) {

fail();
return;
}
if (lastSequenceItem) {
let distance = BV.dist(lastSequenceItem.position[0], lastSequenceItem.position[1], event.pageX, event.pageY);
if (distance > maxInbetweenDistancePx) {

fail();

if (nowTime - lastSequenceItem.time < minSilenceBeforeDurationMs) {
return;
}
}
}
sequenceArr.push({
isDown: true,
time: nowTime,
position: [event.pageX, event.pageY],
pointerId: event.pointerId
});


if (sequenceArr.length > 1) {
clearTimeout(timeoutObj.maxUntilSecondDown);
} else if (!setupTimeout('maxUntilSecondDown', fail, event.time + maxUntilSecondDownDurationMs)) {

fail();
return;
}


clearTimeout(timeoutObj.fail);
if (!setupTimeout('fail', fail, event.time + maxPressedDurationMs)) {

fail();
return;
}
}
if (lastSequenceItem && event.type === 'pointermove' && lastSequenceItem.pointerId === event.pointerId) {
/*if(lastSequenceItem.pointerId !== event.pointerId) {
console.log('another pointer mixing in -> fail');
fail();
return;
}*/
let distance = BV.dist(lastSequenceItem.position[0], lastSequenceItem.position[1], event.pageX, event.pageY);
if (distance > maxPressedDistancePx) {

fail();
return;
}
}
if (lastSequenceItem && event.type === 'pointerup') {
if (lastSequenceItem.pointerId !== event.pointerId) {
fail();
return;
}
if (nowTime >= lastSequenceItem.time + maxPressedDurationMs) {
fail();
return;
}
clearTimeout(timeoutObj.fail);

if (sequenceArr.length < 3) {
if (!setupTimeout('fail', fail, event.time + maxUpToUpDurationMs)) {
fail();
return;
}

sequenceArr = [
lastSequenceItem,
{
isUp: true,
time: nowTime,
position: [event.pageX, event.pageY]
}
];
return;
}

if (nowTime < sequenceArr[1].time + maxUpToUpDurationMs) {


sequenceArr.push({
pageX: event.pageX,
pageY: event.pageY
});
if (!setupTimeout('success', success, event.time + minSilenceAfterMs)) {
fail();
}
} else {
fail();
}

}
}




this.chainIn = function (event) {

processEvent(event);

if (sequenceArr.length === 0) {
fail();
return event;
}

eventQueueArr.push(event);
return null;
};

this.setChainOut = function (func) {
chainOut = func;
};

this.setAllowedPointerTypeArr = function (arr) {
allowedPointerTypeArr = arr;
};

this.setAllowedButtonArr = function (arr) {
allowedButtonArr = arr;
};
};


/**
* A ChainElement. Detects a single tap, done with N 'touch' pointers
*
* p = {
*      fingers: number - number of fingers
*      onTap: function() - fires when tap occurs
* }
*
* chainIn
* setChainOut
*
* @param p
* @constructor
*/
BV.EventChain.NFingerTapper = function (p) {

let fingers = p.fingers;
let chainOut = function () {
};

const minSilenceBeforeDurationMs = 50;
const maxTapMs = 500;
const maxFirstLastFingerDownMs = 250;
const maxPressedDistancePx = 12;
const silenceAfterDurationMs = 250;


/*
fingerObj = {
pointerId: number,
downTime: number,
downPageX: number,
downPageY: number,
isUp: boolean
}
*/
let fingerArr = [];
let firstDownTime;
let eventQueueArr = [];
let lastEventTime = 0;
let pointersDownIdArr = [];

function fail() {
if (eventQueueArr.length === 0) {
return;
}
clearTimeout(timeoutObj.firstLastDownTimeout);
clearTimeout(timeoutObj.tapTimeout);
for (let i = 0; i < eventQueueArr.length; i++) {
chainOut(eventQueueArr[i]);
}
eventQueueArr = [];
fingerArr = [];
}

function success() {
clearTimeout(timeoutObj.firstLastDownTimeout);
clearTimeout(timeoutObj.tapTimeout);
eventQueueArr = [];
fingerArr = [];
p.onTap();
}

let nowTime;
let timeoutObj = {
firstLastDownTimeout: null,
tapTimeout: null
};

function setupTimeout(timeoutStr, timeMS) {
let diff = timeMS - nowTime;

if (diff <= 0) {
return false;
}
timeoutObj[timeoutStr] = setTimeout(fail, diff);
return true;
}

function processEvent(event) {

let tempLastEventTime = lastEventTime;
lastEventTime = event.time;

if (event.type === 'pointerdown') {
pointersDownIdArr.push(event.pointerId);
} else if (event.type === 'pointerup') {
for (let i = 0; i < pointersDownIdArr.length; i++) {
if (pointersDownIdArr[i] === event.pointerId) {
pointersDownIdArr.splice(i, 1);
break;
}
}
}

if (event.pointerType !== 'touch') {
if (fingerArr.length > 0) {
fail();
}
return;
}

nowTime = performance.now();

if (event.type === 'pointerdown') {

if (fingerArr.length + 1 !== pointersDownIdArr.length) {
fail();
return;
}
if (fingerArr.length === fingers) {

fail();
return;
}
if (fingerArr.length > 0 && event.time - maxFirstLastFingerDownMs > fingerArr[0].downTime) {

fail();
return;
}
if (fingerArr.length === 0 && event.time - minSilenceBeforeDurationMs < tempLastEventTime) {

fail();
return;
}

if (fingerArr.length === 0) {
firstDownTime = event.time;

if (!setupTimeout('firstLastDownTimeout', event.time + maxFirstLastFingerDownMs) || !setupTimeout('tapTimeout', event.time + maxTapMs)) {
fail();
return;
}

}
fingerArr.push({
pointerId: event.pointerId,
downTime: event.time,
downPageX: event.pageX,
downPageY: event.pageY
});
return;

}

if (event.type === 'pointermove') {

if (fingerArr.length === 0) {

return;
}

let fingerObj = null;
for (let i = 0; i < fingerArr.length; i++) {
if (fingerArr[i].pointerId === event.pointerId) {
fingerObj = fingerArr[i];
break;
}
}
if (fingerObj === null) {
fail();
return;
}

if (event.time - maxTapMs > firstDownTime) {

fail();
return;
}

let distance = BV.dist(event.pageX, event.pageY, fingerObj.downPageX, fingerObj.downPageY);
if (distance > maxPressedDistancePx) {

fail();
return;
}

}

if (event.type === 'pointerup') {

if (fingerArr.length === 0) {

return;
}


if (fingerArr.length !== fingers) {

fail();
return;
}

let fingerObj = null;
let i = 0;
for (; i < fingerArr.length; i++) {
if (fingerArr[i].pointerId === event.pointerId) {
fingerObj = fingerArr[i];
break;
}
}
if (fingerObj === null) {

return;
}

if (event.time - maxTapMs > firstDownTime) {

fail();
return;
}

let distance = BV.dist(event.pageX, event.pageY, fingerObj.downPageX, fingerObj.downPageY);
if (distance > maxPressedDistancePx) {


fail();
return;
}

fingerObj.isUp = true;

let allAreUp = true;
for (let i = 0; i < fingerArr.length; i++) {
if (!fingerArr[i].isUp) {
allAreUp = false;
break;
}
}


if (allAreUp) {
success();
return true;
}

}


}




this.chainIn = function (event) {

let result = processEvent(event);



if (result === true) {

return null;
}
if (fingerArr.length === 0) {
return event;
} else {
eventQueueArr.push(event);
}

return null;

};

this.setChainOut = function (func) {
chainOut = func;
};
};


/**
* A ChainElement. Detects a pinch zooming (2 touch pointers). If one finger lifts, then will use the remaining.
* Further pointers are ignored, but their events get swallowed during the pinching.
* pinching ends when ALL pointers are lifted.
* Events passed through if no pinching.
*
* p = {
*      onPinch: function({type: 'end'} | {
*          type: 'move',
*          relX: number,
*          relY: number,
*          downRelX: number,
*          downRelY: number,
*          angleDeg: number,
*          scale: number
*      }) - fires when pinching occurs
* }
*
* chainIn
* setChainOut
*
* @param p
* @constructor
*/
BV.EventChain.PinchZoomer = function (p) {

const firstFingerMaxDistancePx = 10;
const untilSecondFingerDurationMs = 250;

let chainOut = function () {
};
let pointersDownIdArr = [];
/*
gestureObj = {
touchPointerArr: Array of {
pointerId: number,
relX: number,
relY: number,
downRelX: number,
downRelY: number
},
otherPointerIdArr: number[],
isInProgress: boolean
}
*/
let gestureObj = null;
let eventQueueArr = [];


function end() {
gestureObj = null;
eventQueueArr = [];
}

function fail(doSwallow) {
if (!gestureObj) {
return;
}

clearTimeout(timeoutObj.secondFingerTimeout);
if (!doSwallow) {
for (let i = 0; i < eventQueueArr.length; i++) {
chainOut(eventQueueArr[i]);
}
}
end();
}


let nowTime;
let timeoutObj = {
secondFingerTimeout: null
};

function setupTimeout(timeoutStr, targetFunc, timeMS) {
let diff = timeMS - nowTime;
if (diff <= 0) {
return false;
}
timeoutObj[timeoutStr] = setTimeout(targetFunc, diff);
return true;
}


function processEvent(event) {

if (event.type === 'pointerdown') {
pointersDownIdArr.push(event.pointerId);

} else if (event.type === 'pointerup') {
for (let i = 0; i < pointersDownIdArr.length; i++) {
if (pointersDownIdArr[i] === event.pointerId) {
pointersDownIdArr.splice(i, 1);
break;
}
}
}


if (
!gestureObj && (
event.pointerType !== 'touch' ||
(event.type === 'pointermove' && pointersDownIdArr.length > 0) ||
pointersDownIdArr.length > 1 ||
event.type === 'pointerup'
)
) {
return;
}

nowTime = performance.now();



if (event.type === 'pointerdown') {

if (gestureObj) {
if (event.pointerType === 'touch') {

gestureObj.touchPointerArr.push({
pointerId: event.pointerId,
relX: event.relX,
relY: event.relY
});

if (gestureObj.isInProgress) {
continuePinch(gestureObj, {
type: 'down',
index: gestureObj.touchPointerArr.length - 1
});
} else {
clearTimeout(timeoutObj.secondFingerTimeout);
gestureObj.isInProgress = true;
beginPinch(gestureObj);
}
return;

} else {

if (gestureObj.isInProgress) {
gestureObj.otherPointerIdArr.push(event.pointerId);
} else {
fail();
}
return;
}


} else {

gestureObj = {
touchPointerArr: [{
pointerId: event.pointerId,
relX: event.relX,
relY: event.relY,
downRelX: event.relX,
downRelY: event.relY
}],
otherPointerIdArr: [],
isInProgress: false
};
if (!setupTimeout('secondFingerTimeout', function () {
fail();
}, event.time + untilSecondFingerDurationMs)) {
fail();
return;
}
return;
}

}



if (event.type === 'pointermove' && event.pointerType === 'touch') {


let touchPointerObj = null;
let i = 0;
for (; i < gestureObj.touchPointerArr.length; i++) {
if (event.pointerId === gestureObj.touchPointerArr[i].pointerId) {
touchPointerObj = gestureObj.touchPointerArr[i];
break;
}
}



touchPointerObj.relX = event.relX;
touchPointerObj.relY = event.relY;

if (!gestureObj.isInProgress) {
let distance = BV.dist(touchPointerObj.downRelX, touchPointerObj.downRelY, touchPointerObj.relX, touchPointerObj.relY);
if (distance > firstFingerMaxDistancePx) {
fail();
return;
}

} else {
if (i < 2) {
continuePinch(gestureObj, {
type: 'move',
index: i
});
}
}

return;
}



if (event.type === 'pointerup') {


if (event.pointerType === 'touch') {
let i = 0;
for (; i < gestureObj.touchPointerArr.length; i++) {
if (gestureObj.touchPointerArr[i].pointerId === event.pointerId) {
gestureObj.touchPointerArr.splice(i, 1);
break;
}
}
if (gestureObj.touchPointerArr.length > 0) {
continuePinch(gestureObj, {
type: 'up',
index: i
});
}

} else {
for (let i = 0; i < gestureObj.otherPointerIdArr.length; i++) {
if (gestureObj.otherPointerIdArr[i] === event.pointerId) {
gestureObj.otherPointerIdArr.splice(i, 1);
break;
}
}
}


if (gestureObj.touchPointerArr.length === 0 && gestureObj.otherPointerIdArr.length === 0) {
if (gestureObj.isInProgress) {
end();
endPinch();
} else {
fail();
}
return;
}

}


}




let pincherArr = [];

function beginPinch(gestureObj) {

for (let i = 0; i < gestureObj.touchPointerArr.length; i++) {
let pointerObj = gestureObj.touchPointerArr[i];
pincherArr.push({
pointerId: pointerObj.pointerId,
relX: pointerObj.relX,
relY: pointerObj.relY,
downRelX: pointerObj.relX,
downRelY: pointerObj.relY
});
}

let event = {
type: 'move',
angleRad: 0,
scale: 1
};

if (pincherArr.length === 1) {
event.relX = pincherArr[0].downRelX;
event.relY = pincherArr[0].downRelY;
} else {
event.relX = 0.5 * (pincherArr[0].downRelX + pincherArr[1].downRelX);
event.relY = 0.5 * (pincherArr[0].downRelY + pincherArr[1].downRelY);
}
event.downRelX = event.relX;
event.downRelY = event.relY;

p.onPinch(event);

}


function continuePinch(gestureObj, actionObj) {

if (actionObj.index > 1) {
return;
}

if (actionObj.type === 'move') {

let event;
pincherArr[actionObj.index].relX = gestureObj.touchPointerArr[actionObj.index].relX;
pincherArr[actionObj.index].relY = gestureObj.touchPointerArr[actionObj.index].relY;

if (pincherArr.length === 1) {

event = {
type: 'move',
downRelX: pincherArr[0].downRelX,
downRelY: pincherArr[0].downRelY,
relX: pincherArr[0].relX,
relY: pincherArr[0].relY,
angleRad: 0,
scale: 1
};

} else {

let startDist = BV.dist(pincherArr[0].downRelX, pincherArr[0].downRelY, pincherArr[1].downRelX, pincherArr[1].downRelY);
let dist = BV.dist(pincherArr[0].relX, pincherArr[0].relY, pincherArr[1].relX, pincherArr[1].relY);

let startAngle = BV.pointsToAngleRad({
x: pincherArr[0].downRelX,
y: pincherArr[0].downRelY
}, {x: pincherArr[1].downRelX, y: pincherArr[1].downRelY});
let angle = BV.pointsToAngleRad({
x: pincherArr[0].relX,
y: pincherArr[0].relY
}, {x: pincherArr[1].relX, y: pincherArr[1].relY});

event = {
type: 'move',
downRelX: 0.5 * (pincherArr[0].downRelX + pincherArr[1].downRelX),
downRelY: 0.5 * (pincherArr[0].downRelY + pincherArr[1].downRelY),
relX: 0.5 * (pincherArr[0].relX + pincherArr[1].relX),
relY: 0.5 * (pincherArr[0].relY + pincherArr[1].relY),
angleRad: angle - startAngle,
scale: dist / startDist
};

}

p.onPinch(event);

} else if (actionObj.type === 'down' || actionObj.type === 'up') {
endPinch();
beginPinch(gestureObj);
}

}

function endPinch() {
pincherArr = [];
p.onPinch({
type: 'end'
});
}




this.chainIn = function (event) {
processEvent(event);
if (gestureObj) {
if (!gestureObj.isInProgress) {
eventQueueArr.push(event);
}
} else {
return event;
}
return null;
};

this.setChainOut = function (func) {
chainOut = func;
};
};


/**
* A ChainElement. Splits up coalesced events into their own pointermove events. Otherwise regular pass through.
*
* @constructor
*/
BV.EventChain.CoalescedExploder = function () {

let chainOut = function () {
};



this.chainIn = function (event) {

if (event.type === 'pointermove') {

if (event.coalescedArr.length > 0) {

let eventCopy = JSON.parse(JSON.stringify(event));
eventCopy.coalescedArr = [];
let coalescedItem;

for (let i = 0; i < event.coalescedArr.length; i++) {

if (i > 0) {
eventCopy = JSON.parse(JSON.stringify(event));
}
coalescedItem = event.coalescedArr[i];

eventCopy.pageX = coalescedItem.pageX;
eventCopy.pageY = coalescedItem.pageY;
eventCopy.relX = coalescedItem.relX;
eventCopy.relY = coalescedItem.relY;
eventCopy.dX = coalescedItem.dX;
eventCopy.dY = coalescedItem.dY;
eventCopy.time = coalescedItem.time;
if (i < event.coalescedArr.length - 1) {
eventCopy.isCoalesced = true;
}

chainOut(eventCopy);
}

} else {
return event;
}
} else {
return event;
}

return null;
};

this.setChainOut = function (func) {
chainOut = func;
};
};

BV.EventChain.OnePointerLimiter = function (pointers) {

let chainOut = function () {
};

let downPointerId = null;
let ignorePointerIdArr = [];




this.chainIn = function (event) {

if (ignorePointerIdArr.includes(event.pointerId)) {
if (event.type === 'pointerup') {
for (let i = 0; i < ignorePointerIdArr.length; i++) {
if (ignorePointerIdArr[i] === event.pointerId) {
ignorePointerIdArr.splice(i, 1);
break;
}
}
}
return null;
}

if (downPointerId === null) {
if (event.type === 'pointerdown') {
downPointerId = event.pointerId;
}
return event;

} else {
if (event.pointerId !== downPointerId) {
if (event.type === 'pointerdown') {
ignorePointerIdArr.push(event.pointerId);
}
return null;
}
if (event.type === 'pointerup') {
downPointerId = null;
}
return event;
}

return null;

};

this.setChainOut = function (func) {
chainOut = func;
};

};


/**
* Not really and event chain element. but pretty similar.
*
* Processes draw input events. When shift held -> linetool
* line events - what PcCanvasWorkspace passes onDraw(e)
*
* p = {
*     onDraw: function(drawEvent)
* }
*
* pass input in with process(drawEvent)
*
* modifies draw event to include such events:
* {
*     type: 'line',
*     x0: null,
*     y0: null,
*     pressure0: null,
*     x1: number,
*     y1: number,
*     pressure1: number
* }
*
* @param p
* @constructor
*/
BV.EventChain.LinetoolProcessor = function (p) {

let downEvent = null;
let eventQueue = [];
let direction = null;
const DIR_X = 0, DIR_Y = 1;

this.process = function (event) {
if (event.type === 'down') {
downEvent = event;
direction = null;

if (event.shiftIsPressed) {

p.onDraw({
type: 'line',
x0: null,
y0: null,
pressure0: null,
x1: event.x,
y1: event.y,
pressure1: event.pressure
});

eventQueue.push(event);
return;
}

}

if (event.type === 'move') {

if (event.shiftIsPressed) {

if (direction === null) {
let dX = Math.abs(event.x - downEvent.x);
let dY = Math.abs(event.y - downEvent.y);

if (dX > 5 || dY > 5) {
direction = dX > dY ? DIR_X : DIR_Y;

for (let i = 0; i < eventQueue.length; i++) {
let e = eventQueue[i];
if (direction === DIR_X) {
e.y = downEvent.y;
} else {
e.x = downEvent.x;
}
p.onDraw(JSON.parse(JSON.stringify(e)));
}
eventQueue = [];
}
}

if (direction === null) {
eventQueue.push(event);
return;
}

if (direction === DIR_X) {
event.y = downEvent.y;
} else {
event.x = downEvent.x;
}

} else {
if (eventQueue.length > 0) {
for (let i = 0; i < eventQueue.length; i++) {
p.onDraw(JSON.parse(JSON.stringify(eventQueue[i])));
}
eventQueue = [];
}
}

}

if (event.type === 'up') {
eventQueue = [];
}

p.onDraw(JSON.parse(JSON.stringify(event)));
};
};


/**
* cleans up DrawEvents. More trustworthy events. EventChain element
*
* that events can only go line this: down -> n x move -> up
* so, sanitizes this: down, down, down. becomes only one down. the other downs are ignored/swallowed
* @constructor
*/
BV.EventChain.LineSanitizer = function () {

let chainOut = function () {
};

let isDrawing = false;


this.chainIn = function (event) {

if (event.type === 'down') {
if (isDrawing) {

chainOut({
type: 'up',
scale: event.scale,
shiftIsPressed: event.shiftIsPressed,
isCoalesced: false
});
} else {
isDrawing = true;
}
}
if (!isDrawing && (event.type === 'move' || event.type === 'up')) {

return null;
}

if (event.type === 'up' && isDrawing) {
isDrawing = false;
}

return event;
};
this.setChainOut = function (func) {
chainOut = func;
};
this.getIsDrawing = function () {
return isDrawing;
};
};


/**
* Line smoothing. EventChain element. Smoothing via blending new position with old position.
* for onDraw events from PcCanvasWorkspace.
*
* p = {
*     smoothing: number,
* }
*
* smoothing > 0: will fire DrawEvents in interval when no new move events
*
* type: 'line' Events are just passed through.
*
* @param p
* @constructor
*/
BV.EventChain.LineSmoothing = function (p) {

let chainOut = function () {
};
let smoothing = BV.clamp(p.smoothing, 0, 1);
let lastMixedInput;
let interval;
let timeout;



this.chainIn = function (event) {
event = JSON.parse(JSON.stringify(event));
clearTimeout(timeout);
clearInterval(interval);

if (event.type === 'down') {
lastMixedInput = {
x: event.x,
y: event.y,
pressure: event.pressure
};
}

if (event.type === 'move') {

let inputX = event.x;
let inputY = event.y;
let inputPressure = event.pressure;

event.x = BV.mix(event.x, lastMixedInput.x, smoothing);
event.y = BV.mix(event.y, lastMixedInput.y, smoothing);
event.pressure = BV.mix(event.pressure, lastMixedInput.pressure, smoothing);
lastMixedInput = {
x: event.x,
y: event.y,
pressure: event.pressure
};

if (smoothing > 0) {
timeout = setTimeout(function () {
interval = setInterval(function () {
event = JSON.parse(JSON.stringify(event));

event.x = BV.mix(inputX, lastMixedInput.x, smoothing);
event.y = BV.mix(inputY, lastMixedInput.y, smoothing);
event.pressure = BV.mix(inputPressure, lastMixedInput.pressure, smoothing);
lastMixedInput = {
x: event.x,
y: event.y,
pressure: event.pressure
};

chainOut(event);
}, 35);
}, 80);
}

}

return event;
};

this.setChainOut = function (func) {
chainOut = func;
};

this.setSmoothing = function (s) {
smoothing = BV.clamp(s, 0, 1);
};
};

})();
