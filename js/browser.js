(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
//Felipe Pazos
//Voxelfy, 8/15/2016
//File to take a provided STL file, and convert it to a voxel representation.

'use strict';

var parseSTL = require('parse-stl');
var fs = require('fs');

var buf = fs.readFileSync('mesh.stl');
var mesh = parseSTL(buf);

console.log(mesh);


},{"fs":1,"parse-stl":5}],3:[function(require,module,exports){

function parse(str) {
  if(typeof str !== 'string') {
    str = str.toString();
  }

  var positions = [];
  var cells = [];
  var faceNormals = [];
  var name = null;

  var lines = str.split('\n');
  var cell = [];

  for(var i=0; i<lines.length; i++) {

    var parts = lines[i]
      .trim()
      .split(' ')
      .filter(function(part) {
        return part !== '';
      });

    switch(parts[0]) {
      case 'solid':
        name = parts.slice(1).join(' ');
        break;
      case 'facet':
        var normal = parts.slice(2).map(Number);
        faceNormals.push(normal);
        break;
      case 'vertex':
        var position = parts.slice(1).map(Number);
        cell.push(positions.length);
        positions.push(position);
        break;
      case 'endfacet':
        cells.push(cell);
        cell = [];
      default:
        // skip
    }
  }

  return {
    positions: positions,
    cells: cells,
    faceNormals: faceNormals,
    name: name
  };
}

module.exports = parse;

},{}],4:[function(require,module,exports){

function readVector(buf, off) {
  return [
    buf.readFloatLE(off + 0),
    buf.readFloatLE(off + 4),
    buf.readFloatLE(off + 8)
  ];
}

function parse(buf) {
  var off = 80; // skip header

  var triangleCount = buf.readUInt32LE(off); 
  off += 4;

  var cells = [];
  var positions = [];
  var faceNormals = [];

  for(var i=0; i<triangleCount; i++) {
    var cell = [];
    var normal = readVector(buf, off);
    off += 12; // 3 floats

    faceNormals.push(normal);

    for(var j=0; j<3; j++) {
      var position = readVector(buf, off);
      off += 12;
      cell.push(positions.length);
      positions.push(position);
    }

    cells.push(cell);
    off += 2; // skip attribute byte count
  }

  return {
    positions: positions,
    cells: cells,
    faceNormals: faceNormals
  };
}

module.exports = parse;
},{}],5:[function(require,module,exports){
var parseASCII  = require('parse-stl-ascii');
var parseBinary = require('parse-stl-binary');

function parse(buf) {
  if(typeof buf === 'string') {
    return parseASCII(buf);
  }

  var triangleCount = buf.readUInt32LE(80);
  var expectedSize = 80 + 4 + triangleCount * ((4 * 3) * 4 + 2);

  if(expectedSize === buf.length) {
    return parseBinary(buf);
  }

  return parseASCII(buf);
}

module.exports = parse;
},{"parse-stl-ascii":3,"parse-stl-binary":4}]},{},[2]);
