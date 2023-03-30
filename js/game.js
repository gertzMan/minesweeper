'use strict';

const EMPTY = '';
const MINE = '💥';
const FLAG = '🚩';

var gBoard;
var gStopperIntervalId;
var gLevel = { SIZE: 4, MINES: 2 };
var gGame;
var gIsFirstClick;
var gMinePositions;

//rendering and dom

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
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  elCell.innerText = value;
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

function handleMineClick(i, j) {
  console.log('boom');
  renderCell(i, j, MINE);
  gGame.livesLeft--;
  setLivesLeft(gGame.livesLeft);
  checkGameOver();
  gGame.shownCount++;
  gBoard[i][j].isShown = true;
}

function exposeAllMines() {
  for (var i = 0; i < gMinePositions.length; i++) {
    const mineRowIndex = gMinePositions[i].i;
    const mineColIndex = gMinePositions[i].j;
    renderCell(mineRowIndex, mineColIndex, MINE);
  }
}

function manageFirstClick(i, j) {
  startTimer();
  gIsFirstClick = false;
  deployMines(i, j);
  setMinesNegsCount(gBoard);
}

function expandShown(elCell, rowIdx, colIdx) {
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
      } else {
        currCell.isShown = true;
        elCurrCell.classList.add('revealed');
        gGame.shownCount++;
        renderCell(i, j, `${currCell.minesAroundCount}`);
      }
    }
  }
}
function restartStopper() {
  const elStopperDisplay = document.querySelector('.stopper-display');
  elStopperDisplay.innerText = `Seconds Elapsed: 0`;
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

function startTimer() {
  var startTime = Date.now();
  const elStopperDisplay = document.querySelector('.stopper-display');
  gStopperIntervalId = setInterval(() => {
    const diff = Date.now() - startTime;
    gGame.secsPassed = Math.floor(diff / 1000);
    elStopperDisplay.innerText = `Seconds Elapsed: ${gGame.secsPassed}`;
  }, 1000);
}

//events

function onInit() {
  gGame = {
    isOn: true, //boolean - true playing is allowed, false not allowed
    shownCount: 0, // how many cells are shown
    markedCount: 0, // how many cells are marked
    secsPassed: 0, // how many seconds passed
    livesLeft: 3,
  };
  gIsFirstClick = true;
  restartStopper();
  setSmiley('normal');
  setLivesLeft(3);
  // gMinesShown = 0;
  gBoard = buildBoard();
  preventRightClick();
  renderBoard();
}

function onSmileyClicked() {
  clearInterval(gStopperIntervalId);
  onInit();
}

function onChangeLevel(level) {
  clearInterval(gStopperIntervalId);
  const levelMap = {
    beginner: { SIZE: 4, MINES: 2 },
    medium: { SIZE: 8, MINES: 14 },
    expert: { SIZE: 12, MINES: 32 },
  };
  gLevel = levelMap[level];
  onInit();
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

function onCellClicked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isMarked) return;
  if (gIsFirstClick) {
    manageFirstClick(i, j);
  }
  const currCell = gBoard[i][j];
  if (currCell.isMine) {
    handleMineClick(i, j);
  } else if (currCell.minesAroundCount === 0) {
    //this cell has no mine as neighbors
    elCell.classList.add('revealed'); //no-mines-around
    currCell.isShown = true;
    gGame.shownCount++;
    //renderCell(i, j, '0');
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

//game logic

function buildBoard() {
  const board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = getInitialCell();
    }
  }

  return board;
}

function getInitialCell() {
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
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      gBoard[i][j].minesAroundCount = getMineNegsCount(i, j, board);
    }
  }
}

function checkGameOver() {
  // Game ends when all mines are marked,
  //  and all the other cells are shown

  if (gGame.livesLeft === 0) {
    console.log('you lose');
    clearInterval(gStopperIntervalId);
    setSmiley('sad');
    exposeAllMines();
    gGame.isOn = false;
    return;
  }

  const numOfCells = gLevel.SIZE ** 2;
  const isGameWon = gGame.markedCount + gGame.shownCount === numOfCells;
  if (isGameWon) {
    console.log('you win');
    clearInterval(gStopperIntervalId);
    setSmiley('happy');
    gGame.isOn = false;
    return;
  }
}
