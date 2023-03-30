'use strict';

const EMPTY = '';
const MINE = '💥';
const FLAG = '🚩';

var gBoard;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame;
var gIsFirstClick;
var gMinePositions;
function onInit() {
  gGame = {
    isOn: true, //boolean - true playing is allowed, false not allowed
    shownCount: 0, // how many cells are shown
    markedCount: 0, // how many cells are marked
    secsPassed: 0, // how many seconds passed
    livesLeft: 3,
  };
  gIsFirstClick = true;
  setSmiley('normal');
  setLivesLeft(3);
  gBoard = buildBoard();
  preventRightClick();
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

function deployMines(idxI, idxJ) {
  gMinePositions = [];
  var validCells = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (!(i === idxI && j === idxJ)) {
        validCells.push({ i: i, j: j });
      }
    }
  }

  for (var i = 0; i < gLevel.MINES; i++) {
    const randIdx = getRandomInt(0, validCells.length);
    const mineCoordinates = validCells[randIdx];
    gMinePositions.push(validCells[randIdx]);
    validCells.splice(randIdx, 1);
    gBoard[mineCoordinates.i][mineCoordinates.j].isMine = true;
  }

  // gBoard[2][1].isMine = true;
  // gBoard[2][2].isMine = true;
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
  if (!gGame.isOn || gBoard[i][j].isMarked) return;
  if (gIsFirstClick) {
    manageFirstClick(i, j);
  }
  const currCell = gBoard[i][j];
  if (currCell.isMine) {
    handleMineClick();
  } else if (currCell.minesAroundCount === 0) {
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
    renderCell(i, j, `${currCell.minesAroundCount}`);
  }
  checkGameOver();
}
function handleMineClick() {
  console.log('boom');
  gGame.livesLeft--;
  setLivesLeft(gGame.livesLeft);
  checkGameOver();
}
function checkGameOver() {
  // Game ends when all mines are marked,
  //  and all the other cells are shown
  const numOfCells = gLevel.SIZE ** 2;
  const isGameWon = gGame.markedCount + gGame.shownCount === numOfCells;
  if (isGameWon) {
    console.log('you win');
    setSmiley('happy');
    gGame.isOn = false;
    return;
  }
  if (gGame.livesLeft === 0) {
    console.log('you win');
    setSmiley('sad');
    exposeAllMines();
    gGame.isOn = false;
    return;
  }
}
function exposeAllMines() {
  for (var i = 0; i < gMinePositions.length; i++) {
    const mineRowIndex = gMinePositions[i].i;
    const mineColIndex = gMinePositions[i].j;
    renderCell(mineColIndex, mineColIndex, MINE);
  }
}

function manageFirstClick(i, j) {
  gIsFirstClick = false;
  deployMines(i, j);
  setMinesNegsCount(gBoard);
}

function onCellMarked(elCell, i, j) {
  const currCell = gBoard[i][j];
  if (!gGame.isOn || currCell.isShown) return;
  if (currCell.isMarked) {
    currCell.isMarked = false;
    renderCell(i, j, EMPTY);
    gGame.markedCount--;
  } else {
    currCell.isMarked = true;
    renderCell(i, j, FLAG);
    gGame.markedCount++;
  }
  checkGameOver();
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
      if (currCell.isShown || currCell.isMarked) {
        continue;
      }
      if (currCell.isMine) {
        continue;
      } else if (currCell.minesAroundCount === 0) {
        elCurrCell.classList.add('revealed'); //no-mines-around'
        currCell.isShown = true;
        gGame.shownCount++;
        renderCell(i, j, '0');
      } else {
        currCell.isShown = true;
        elCurrCell.classList.add('revealed');
        gGame.shownCount++;
        renderCell(i, j, `${currCell.minesAroundCount}`);
      }
    }
  }
}

function onChangeLevel(level) {
  const levelMap = {
    beginner: { SIZE: 4, MINES: 2 },
    medium: { SIZE: 8, MINES: 14 },
    expert: { SIZE: 12, MINES: 32 },
  };
  gLevel = levelMap[level];
  onInit();
}

function setSmiley(status) {
  const smileyMap = {
    normal: '😃',
    sad: '🤯',
    happy: '😎',
  };
  const elSmileyContainer = document.querySelector('.smiley-container');
  elSmileyContainer.innerText = smileyMap[status];
}

function setLivesLeft(lives) {
  const elLivesCounterContainer = document.querySelector(
    '.lives-counter-container'
  );
  elLivesCounterContainer.innerText = `Lives Left:  ${lives}`;
}
