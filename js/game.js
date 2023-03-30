'use strict';

const EMPTY = '';
const MINE = '💥';
const FLAG = '🚩';

var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame;

function onInit() {
  gGame = {
    isOn: true, //boolean - true playing is allowed, false not allowed
    shownCount: 0, // how many cells are shown
    markedCount: 0, // how many cells are marked
    secsPassed: 0, // how many seconds passed
  };

  gBoard = buildBoard();
  deployMines();
  setMinesNegsCount(gBoard);
  renderBoard();
}

function buildBoard() {
  const board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = getInitialCell(i, j);
    }
  }

  return board;
}

function getInitialCell(posI, posJ) {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
}

function deployMines() {
  // for (var i = 0; i < gLevel.MINES; i++) {
  //   const randI = getRandomInt(0, gLevel.SIZE);
  //   const randJ = getRandomInt(0, gLevel.SIZE);
  //   gBoard[randI][randJ].isMine = true;
  // }
  gBoard[2][1].isMine = true;
  gBoard[2][2].isMine = true;
}

function renderBoard() {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < gBoard.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < gBoard.length; j++) {
      var cellClass = getClassName(i, j) + ' ';
      strHTML += `<td class="cell ${cellClass}"
            oncontextmenu="onCellMarked(this,${i},${j})" onclick="onCellClicked(this,${i},${j})">`;
      strHTML += '</td>\n';
    }
    strHTML += '</tr>\n';
  }
  strHTML += '</tbody></table>';
  const elBoardContainer = document.querySelector('.board-container');
  elBoardContainer.innerHTML = strHTML;
}

function renderCell(i, j, value) {
  // select the elCell and set the value
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  elCell.innerText = value;
}

function getClassName(i, j) {
  var cellClass = `cell-${i}-${j}`;
  return cellClass;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      gBoard[i][j].minesAroundCount = getMineNegsCount(i, j, board);
    }
  }
}

function getMineNegsCount(rowIdx, colIdx, board) {
  var negsMineCount = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[i].length) continue;
      if (board[i][j].isMine) negsMineCount++;
    }
  }
  return negsMineCount;
}

function onCellClicked(elCell, i, j) {
  // console.log({ elCell, i, j });
  if (!gGame.isOn) return;
  const currCell = gBoard[i][j];
  if (currCell.isMine) {
    console.log('boom');
    renderCell(i, j, MINE);
    checkGameOver();
  }
  //if i'm here i'm not a mine
  else if (currCell.minesAroundCount === 0) {
    //this cell has no mine as neighbors
    elCell.classList.add('revealed'); //no-mines-around
    currCell.isShown = true;
    gGame.shownCount++;
    renderCell(i, j, '0');
    expandShown(elCell, i, j);
  } else {
    // this cell has mines as neighbors
    currCell.isShown = true;
    gGame.shownCount++;
    elCell.classList.add('revealed');
    elCell.innerText = `${currCell.minesAroundCount}`;
  }
}

function onCellMarked(elCell) {
  // Called when a cell is right-clicked
  // See how you can hide the context menu on right click
}

function checkGameOver() {
  // Game ends when all mines are marked,
  //  and all the other cells are shown
}

function expandShown(elCell, rowIdx, colIdx) {
  // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.

  // NOTE: start with a basic implementation that only opens the non-mine 1 st degree neighbors
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue;
      if (i === rowIdx && j === colIdx) continue;
      var currCell = gBoard[i][j];
      const elCurrCell = document.querySelector(`.cell-${i}-${j}`);

      if (currCell.isMine) {
        continue;
      } else if (currCell.minesAroundCount === 0) {
        elCurrCell.classList.add('revealed'); //no-mines-around'
        currCell.isShown = true;
        gBoard.shownCount++;
        renderCell(i, j, '0');
      } else {
        currCell.isShown = true;
        gBoard.shownCount++;
        renderCell(i, j, `${currCell.minesAroundCount}`);
      }
    }
  }
}
