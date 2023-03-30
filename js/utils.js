'use strict';

function createMat(ROWS, COLS) {
  const mat = [];
  for (var i = 0; i < ROWS; i++) {
    const row = [];
    for (var j = 0; j < COLS; j++) {
      row.push('');
    }
    mat.push(row);
  }
  return mat;
}
function preventRightClick() {
  const elBoardContainer = document.querySelector('.board-container');
  elBoardContainer.addEventListener('contextmenu', (e) => e.preventDefault());
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function getRandColor() {
  var color = '#';
  var digits = '0123456789ABCDEF';
  for (var i = 0; i < 6; i++) {
    var randomDigit = Math.floor(Math.random() * 16);
    color += digits[randomDigit];
  }
  return color;
}

//just fit to project
function getEmptyLocation(board) {
  var emptyLocations = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j] === EMPTY) {
        emptyLocations.push({ i, j });
      }
    }
  }
  if (!emptyLocations.length) return null;
  var randIdx = getRandomIntInclusive(0, emptyLocations.length - 1);
  return emptyLocations[randIdx];
}

function getClassName(i, j) {
  var cellClass = `cell-${i}-${j}`;
  return cellClass;
}
