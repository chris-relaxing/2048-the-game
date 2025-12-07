let gameboard = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
let divLookup = [['a','e','i','m'], ['b','f','j','n'], ['c','g','k','o'], ['d','h','l','p']]
let action = 1;
let gameboardBefore = ""; // Make this global
// Replay system
let gameHistory = [];
let currentHistoryIndex = -1;
let isReplaying = false;
let isGameOver = false;
let currentScore = 0;
let moveCount = 0;
let bestScore = 0;

// Load best score from localStorage
if (localStorage.getItem('2048-bestScore')) {
    bestScore = parseInt(localStorage.getItem('2048-bestScore'));
}

// Add first two numbers to the board
addRandom();
addRandom();
// Record initial state
recordGameState('init');
updateScoreDisplay();

// Play Again button handler
$(document).ready(function() {
    $('#playAgainBtn').click(function() {
        resetGame();
    });
});

document.onkeydown = function (e) {
  // Replay controls
  if (e.key === 'PageUp') {
      replayBackward();
      return;
  }
  if (e.key === 'PageDown') {
      replayForward();
      return;
  }
  if (e.key === 'Home') {
      jumpToStart();
      return;
  }
  if (e.key === 'End') {
      jumpToEnd();
      return;
  }

  // Don't allow moves during replay or game over
  if (isReplaying) {
      console.log("Cannot make moves during replay. Press End to return to live game.");
      return;
  }

  if (isGameOver) {
      return;
  }

  switch (e.key) {
      case 'ArrowUp':
          upArrow();
          break;
      case 'ArrowDown':
          downArrow();
          break;
      case 'ArrowLeft':
          leftArrow();
          break;
      case 'ArrowRight':
          rightArrow();
          break;
  }
};

/**
* removeZeros - This function returns a given array with all zeros removed.
*/
function removeZeros(arr) {
    // Create new array instead of mutating to avoid issues
    let result = [];
    for(var i=0; i < arr.length; i++) {
        if(arr[i] !== 0 && arr[i] !== undefined && arr[i] !== null) {
            result.push(arr[i]);
        }
    }
    return result;
}

/**
* padZeros - All rows should have a length of 4. So this function will
*   pad zeros on the left side until the length of the array is 4
*/
function padZeros(arr) {
    // Ensure we're working with clean values
    arr = arr.filter(v => v !== undefined && v !== null);
    // Determine current length of row to pad zeros
    let short = 4 - arr.length;
    for(x = 0; x < short; x++) {
        arr.unshift(0);
    }
    return arr;
}


function rowTransform(row) {
    const originalRow = [...row];
    let animations = [];
    let mergeScore = 0; // Track points earned from merges in this row

    // Before the below, let's remove all zeros, then we will see how many digits remain
    row = removeZeros(row);

    // Track which original positions have tiles
    let tilePositions = [];
    for (let i = 0; i < originalRow.length; i++) {
        if (originalRow[i] !== 0 && originalRow[i] !== undefined && originalRow[i] !== null) {
            tilePositions.push({
                originalPos: i,
                value: originalRow[i],
                compactIndex: tilePositions.length,  // position in compacted array before any merges
                mergedThisTurn: false  // Track if this tile was created from a merge this turn
            });
        }
    }

    // Case of 4 numbers in a row with no zeros
    // ------------------------------
    if(row.length === 4) {
        // Check merges from RIGHT to LEFT (for right-aligned movement)

        // Combine the last two numbers, if possible
        if(row[2] === row[3] && !tilePositions[2].mergedThisTurn && !tilePositions[3].mergedThisTurn) {
            animations.push({
                from: tilePositions[2].originalPos,
                toTileIndex: 3,  // Merging into tile at original position 3
                value: row[2],
                merges: true
            });
            row[3] = row[2] * 2;
            mergeScore += row[3]; // Award points equal to the new tile value
            tilePositions[3].value = row[3];
            tilePositions[3].mergedThisTurn = true;  // Mark as merged
            row.splice(2, 1);
            tilePositions.splice(2, 1);
        }
        // Combine the middle two numbers, if possible (after first merge, indices shift!)
        if(row.length >= 3 && row[1] === row[2] && !tilePositions[1].mergedThisTurn && !tilePositions[2].mergedThisTurn) {
            animations.push({
                from: tilePositions[1].originalPos,
                toTileIndex: tilePositions[2].originalPos,  // Merging into the tile at compact index 2
                value: row[1],
                merges: true
            });
            row[2] = row[1] * 2;
            mergeScore += row[2]; // Award points
            tilePositions[2].value = row[2];
            tilePositions[2].mergedThisTurn = true;  // Mark as merged
            row.splice(1, 1);
            tilePositions.splice(1, 1);
        }
        // Combine the first two numbers, if possible
        if(row.length >= 2 && row[0] === row[1] && !tilePositions[0].mergedThisTurn && !tilePositions[1].mergedThisTurn) {
            animations.push({
                from: tilePositions[0].originalPos,
                toTileIndex: tilePositions[1].originalPos,  // Merging into the tile at compact index 1
                value: row[0],
                merges: true
            });
            row[1] = row[0] * 2;
            mergeScore += row[1]; // Award points
            tilePositions[1].value = row[1];
            tilePositions[1].mergedThisTurn = true;  // Mark as merged
            row.splice(0, 1);
            tilePositions.splice(0, 1);
        }

        // NOW calculate final positions and update merge animations
        let remainingLength = row.length;
        let paddingOffset = 4 - remainingLength;

        // Update merge animations with final grid positions
        animations.forEach(anim => {
            if (anim.merges) {
                // Find which remaining tile has this original position
                let tileIndex = tilePositions.findIndex(t => t.originalPos === anim.toTileIndex);
                if (tileIndex !== -1) {
                    anim.to = paddingOffset + tileIndex;
                    delete anim.toTileIndex;
                }
            }
        });

        // Track non-merge movements
        for (let i = 0; i < tilePositions.length; i++) {
            let finalPos = paddingOffset + i;
            if (tilePositions[i].originalPos !== finalPos) {
                animations.push({
                    from: tilePositions[i].originalPos,
                    to: finalPos,
                    value: tilePositions[i].value,
                    merges: false
                });
            }
        }

        row = padZeros(row);
        console.log(originalRow, "row after transform: ", row);
    }
    // ------------------------------
    if(row.length === 3) {
        if(row[1] === row[2]) {
            animations.push({
                from: tilePositions[1].originalPos,
                to: 3,
                value: row[1],
                merges: true
            });
            row[2] = row[1] * 2;
            mergeScore += row[2]; // Award points
            row.splice(1, 1);
            tilePositions.splice(1, 1);
        }
        else if(row[0] === row[1]) {
            let finalPos = 2;
            animations.push({
                from: tilePositions[0].originalPos,
                to: finalPos,
                value: row[0],
                merges: true
            });
            row[1] = row[0] * 2;
            mergeScore += row[1]; // Award points
            row.splice(0, 1);
            tilePositions.splice(0, 1);
        }

        let remainingLength = row.length;
        for (let i = 0; i < tilePositions.length; i++) {
            let finalPos = (4 - remainingLength) + i;
            if (tilePositions[i].originalPos !== finalPos) {
                animations.push({
                    from: tilePositions[i].originalPos,
                    to: finalPos,
                    value: tilePositions[i].value,
                    merges: false
                });
            }
        }

        row = padZeros(row);
        console.log(originalRow, "row after transform: ", row);
    }
    // ------------------------------
    if(row.length === 2) {
        if(row[0] === row[1]) {
            animations.push({
                from: tilePositions[0].originalPos,
                to: 3,
                value: row[0],
                merges: true
            });
            row[1] = row[0] * 2;
            mergeScore += row[1]; // Award points
            row.splice(0, 1);
            tilePositions.splice(0, 1);
        }

        let remainingLength = row.length;
        for (let i = 0; i < tilePositions.length; i++) {
            let finalPos = (4 - remainingLength) + i;
            if (tilePositions[i].originalPos !== finalPos) {
                animations.push({
                    from: tilePositions[i].originalPos,
                    to: finalPos,
                    value: tilePositions[i].value,
                    merges: false
                });
            }
        }

        row = padZeros(row);
        console.log(originalRow, "row after transform: ", row);
    }
    // ------------------------------
    if(row.length === 1) {
        if (tilePositions.length > 0 && tilePositions[0].originalPos !== 3) {
            animations.push({
                from: tilePositions[0].originalPos,
                to: 3,
                value: tilePositions[0].value,
                merges: false
            });
        }
        row = padZeros(row);
        console.log(originalRow, "row after transform: ", row);
    }

    console.log("Transformed row: ", row, "Animations:", animations);
    return { row: row, animations: animations, score: mergeScore };
}

/**
 * executeAnimations - Execute animations based on recorded moves from rowTransform
 */
function executeAnimations(animationInstructions, direction, callback) {
    let divboard = [['a','b','c','d'], ['e','f','g','h'], ['i','j','k','l'], ['m','n','o','p']];
    let animationDuration = 250;
    let animationsCompleted = 0;
    let totalAnimations = animationInstructions.length;

    if (totalAnimations === 0) {
        callback();
        return;
    }

    animationInstructions.forEach((anim, index) => {
        if (!anim || anim.value === undefined || anim.value === null) {
            animationsCompleted++;
            if (animationsCompleted === totalAnimations) {
                callback();
            }
            return;
        }

        let fromRow, fromCol, toRow, toCol;

        if (direction === 'up' || direction === 'down') {
            if (anim.columnIndex === undefined || anim.fromIndex === undefined || anim.toIndex === undefined) {
                animationsCompleted++;
                if (animationsCompleted === totalAnimations) {
                    callback();
                }
                return;
            }
            fromCol = anim.columnIndex;
            toCol = anim.columnIndex;
            fromRow = anim.fromIndex;
            toRow = anim.toIndex;
        } else {
            if (anim.rowIndex === undefined || anim.fromIndex === undefined || anim.toIndex === undefined) {
                animationsCompleted++;
                if (animationsCompleted === totalAnimations) {
                    callback();
                }
                return;
            }
            fromRow = anim.rowIndex;
            toRow = anim.rowIndex;
            fromCol = anim.fromIndex;
            toCol = anim.toIndex;
        }

        let divClass = divboard[fromRow][fromCol];
        let cellDiv = $('.' + divClass);

        let rowDiff = toRow - fromRow;
        let colDiff = toCol - fromCol;
        let translateY = rowDiff * 125;
        let translateX = colDiff * 125;

        cellDiv.css('z-index', '10');
        cellDiv.css('transition', `transform ${animationDuration}ms ease-in-out`);
        cellDiv.css('transform', `translate(${translateX}px, ${translateY}px)`);

        setTimeout(() => {
            cellDiv.css('transition', '');
            cellDiv.css('transform', '');
            cellDiv.css('z-index', '5');

            if (anim.merges) {
                let targetDivClass = divboard[toRow][toCol];
                let targetDiv = $('.' + targetDivClass);
                targetDiv.addClass('tile-merged');
                setTimeout(() => {
                    targetDiv.removeClass('tile-merged');
                }, 200);
            }

            animationsCompleted++;
            if (animationsCompleted === totalAnimations) {
                callback();
            }
        }, animationDuration);
    });
}

/**
 * animateTileMovements - Animate tiles moving to their new positions
 */
function animateTileMovements(beforeBoard, afterBoard, direction, callback) {
    let divboard = [['a','b','c','d'], ['e','f','g','h'], ['i','j','k','l'], ['m','n','o','p']];
    let animationDuration = 1000;
    let animationsCompleted = 0;
    let totalAnimations = 0;

    // First pass: count how many tiles actually need to move
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            let value = beforeBoard[row][col];
            if (value !== 0) {
                let newPos = findTileDestination(beforeBoard, afterBoard, row, col, value, direction);
                // Only count if position actually changed
                if (newPos.row !== row || newPos.col !== col) {
                    totalAnimations++;
                }
            }
        }
    }

    // If no animations needed, just call callback
    if (totalAnimations === 0) {
        callback();
        return;
    }

    // Second pass: animate only the tiles that moved
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            let value = beforeBoard[row][col];
            if (value !== 0) {
                let divClass = divboard[row][col];
                let cellDiv = $('.'+divClass);

                // Find where this tile ends up
                let newPos = findTileDestination(beforeBoard, afterBoard, row, col, value, direction);

                // Only animate if position actually changed
                if (newPos.row !== row || newPos.col !== col) {
                    // Calculate movement distance
                    let rowDiff = newPos.row - row;
                    let colDiff = newPos.col - col;
                    let translateY = rowDiff * 125;
                    let translateX = colDiff * 125;

                    // Raise z-index for animating tile so it appears on top
                    cellDiv.css('z-index', '10');

                    // Animate the movement
                    cellDiv.css('transition', `transform ${animationDuration}ms ease-in-out`);
                    cellDiv.css('transform', `translate(${translateX}px, ${translateY}px)`);

                    setTimeout(() => {
                        cellDiv.css('transition', '');
                        cellDiv.css('transform', '');
                        cellDiv.css('z-index', '5'); // Reset z-index
                        animationsCompleted++;
                        if (animationsCompleted === totalAnimations) {
                            callback();
                        }
                    }, animationDuration);
                }
            }
        }
    }
}

/**
 * findTileDestination - Find where a tile ends up after a move
 * This function finds where a specific tile from beforeBoard ends up in afterBoard
 */
function findTileDestination(beforeBoard, afterBoard, row, col, value, direction) {
    // For merges: a tile can move to a position that has double its value
    // For regular moves: a tile moves to a position with the same value

    if (direction === 'up') {
        // Search upward from original position
        for (let r = 0; r <= row; r++) {
            // Check if this position has our value (regular move) or double our value (merge)
            if (afterBoard[r][col] === value) {
                return { row: r, col: col };
            }
            if (afterBoard[r][col] === value * 2) {
                // This is a merge - the tile at the lower position moves up
                return { row: r, col: col };
            }
        }
    } else if (direction === 'down') {
        // Search downward from original position
        for (let r = 3; r >= row; r--) {
            if (afterBoard[r][col] === value) {
                return { row: r, col: col };
            }
            if (afterBoard[r][col] === value * 2) {
                return { row: r, col: col };
            }
        }
    } else if (direction === 'left') {
        // Search leftward from original position
        for (let c = 0; c <= col; c++) {
            if (afterBoard[row][c] === value) {
                return { row: row, col: c };
            }
            if (afterBoard[row][c] === value * 2) {
                return { row: row, col: c };
            }
        }
    } else if (direction === 'right') {
        // Search rightward from original position
        for (let c = 3; c >= col; c--) {
            if (afterBoard[row][c] === value) {
                return { row: row, col: c };
            }
            if (afterBoard[row][c] === value * 2) {
                return { row: row, col: c };
            }
        }
    }

    // Fallback: tile didn't move
    return { row: row, col: col };
}

/**
 * upArrow - Handle up arrow key press
 */
function upArrow() {
    // Step 1 - Load the column into an array (bottom to top for UP movement)
    // Ensure we're getting actual values, not undefined
    let c0 = [
        gameboard[3][0] || 0,
        gameboard[2][0] || 0,
        gameboard[1][0] || 0,
        gameboard[0][0] || 0
    ];
    let c1 = [
        gameboard[3][1] || 0,
        gameboard[2][1] || 0,
        gameboard[1][1] || 0,
        gameboard[0][1] || 0
    ];
    let c2 = [
        gameboard[3][2] || 0,
        gameboard[2][2] || 0,
        gameboard[1][2] || 0,
        gameboard[0][2] || 0
    ];
    let c3 = [
        gameboard[3][3] || 0,
        gameboard[2][3] || 0,
        gameboard[1][3] || 0,
        gameboard[0][3] || 0
    ];

    let gameboardArrayBefore = deepCopy(gameboard);
    gameboardBefore = gameboard.slice().toString();
    console.log("-gameboard BEFORE", gameboardBefore, gameboardArrayBefore);

    let columns = [c0, c1, c2, c3];

    let allAnimations = [];
    let moveScore = 0; // Track points earned in this move
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;
        moveScore += result.score; // Add merge points from this column

        // Convert array animations to grid animations for UP
        result.animations.forEach(anim => {
            // Only add animation if we have valid data
            if (anim.value !== undefined && anim.value !== null &&
                anim.from !== undefined && anim.to !== undefined) {
                allAnimations.push({
                    fromIndex: 3 - anim.from,  // Reverse because array[0]=row3, array[3]=row0
                    toIndex: 3 - anim.to,
                    columnIndex: i,
                    value: anim.value,
                    merges: anim.merges
                });
            }
        });
    }

    // Update gameboard with new column - ensure no undefined values
    // Remember: columns[i][0] is bottom (row 3), columns[i][3] is top (row 0)
    gameboard[0] = [
        columns[0][3] || 0,
        columns[1][3] || 0,
        columns[2][3] || 0,
        columns[3][3] || 0
    ];
    gameboard[1] = [
        columns[0][2] || 0,
        columns[1][2] || 0,
        columns[2][2] || 0,
        columns[3][2] || 0
    ];
    gameboard[2] = [
        columns[0][1] || 0,
        columns[1][1] || 0,
        columns[2][1] || 0,
        columns[3][1] || 0
    ];
    gameboard[3] = [
        columns[0][0] || 0,
        columns[1][0] || 0,
        columns[2][0] || 0,
        columns[3][0] || 0
    ];
    displayTextMatrix()

    let gameboardArrayAfter = deepCopy(gameboard);
    console.log("-gameboard AFTER", gameboardArrayAfter);

    // Animate the movements, then display and add new tile
    executeAnimations(allAnimations, 'up', function() {
        displayGameboard();
        if (action) {
            addRandom();
            currentScore += moveScore;
            moveCount++;
            updateAllStats();
            recordGameState('up', allAnimations);

            // Check for game over after move
            if (checkGameOver()) {
                setTimeout(() => showGameOver(), 500);
            }
        }
    });
}

/**
 * downArrow - Handle down arrow key press
 */
function downArrow(){
    let gameboardArrayBefore = deepCopy(gameboard);
    console.log("-gameboard BEFORE", gameboardArrayBefore);
    displayTextMatrix();

    let c0 = [gameboard[0][0], gameboard[1][0], gameboard[2][0], gameboard[3][0]];
    let c1 = [gameboard[0][1], gameboard[1][1], gameboard[2][1], gameboard[3][1]];
    let c2 = [gameboard[0][2], gameboard[1][2], gameboard[2][2], gameboard[3][2]];
    let c3 = [gameboard[0][3], gameboard[1][3], gameboard[2][3], gameboard[3][3]];

    let columns = [c0, c1, c2, c3];

    let allAnimations = [];
    let moveScore = 0;
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;
        moveScore += result.score;

        // For DOWN, array is already top-to-bottom, no reversal needed
        result.animations.forEach(anim => {
            if (anim.value !== undefined && anim.value !== null &&
                anim.from !== undefined && anim.to !== undefined) {
                allAnimations.push({
                    fromIndex: anim.from,
                    toIndex: anim.to,
                    columnIndex: i,
                    value: anim.value,
                    merges: anim.merges
                });
            }
        });
    }

    gameboard[0] = [columns[0][0], columns[1][0], columns[2][0], columns[3][0]].map(v => v === undefined || v === null ? 0 : v);
    gameboard[1] = [columns[0][1], columns[1][1], columns[2][1], columns[3][1]].map(v => v === undefined || v === null ? 0 : v);
    gameboard[2] = [columns[0][2], columns[1][2], columns[2][2], columns[3][2]].map(v => v === undefined || v === null ? 0 : v);
    gameboard[3] = [columns[0][3], columns[1][3], columns[2][3], columns[3][3]].map(v => v === undefined || v === null ? 0 : v);
    displayTextMatrix()

    executeAnimations(allAnimations, 'down', function() {
        displayGameboard();
        if (action) {
            addRandom();
            currentScore += moveScore;
            moveCount++;
            updateAllStats();
            recordGameState('down', allAnimations);

            if (checkGameOver()) {
                setTimeout(() => showGameOver(), 500);
            }
        }
    });
}

/**
 * rightArrow - Handle right arrow key press
 */
function rightArrow(){
    let gameboardArrayBefore = deepCopy(gameboard);
    console.log("-gameboard BEFORE", gameboardArrayBefore);
    displayTextMatrix();

    // Use slice to create copies so we don't mutate gameboard directly
    let columns = [
        gameboard[0].slice(),
        gameboard[1].slice(),
        gameboard[2].slice(),
        gameboard[3].slice()
    ];

    let allAnimations = [];
    let moveScore = 0;
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;
        moveScore += result.score;

        // For RIGHT, no reversal needed
        result.animations.forEach(anim => {
            if (anim.value !== undefined && anim.value !== null &&
                anim.from !== undefined && anim.to !== undefined) {
                allAnimations.push({
                    fromIndex: anim.from,
                    toIndex: anim.to,
                    rowIndex: i,
                    value: anim.value,
                    merges: anim.merges
                });
            }
        });
    }

    // Update gameboard with transformed rows - ensure no undefined values
    gameboard[0] = columns[0].map(v => v === undefined || v === null ? 0 : v);
    gameboard[1] = columns[1].map(v => v === undefined || v === null ? 0 : v);
    gameboard[2] = columns[2].map(v => v === undefined || v === null ? 0 : v);
    gameboard[3] = columns[3].map(v => v === undefined || v === null ? 0 : v);
    displayTextMatrix()

    executeAnimations(allAnimations, 'right', function() {
        displayGameboard();
        if (action) {
            addRandom();
            currentScore += moveScore;
            moveCount++;
            updateAllStats();
            recordGameState('right', allAnimations);

            if (checkGameOver()) {
                setTimeout(() => showGameOver(), 500);
            }
        }
    });
}

/**
 * leftArrow - Handle left arrow key press
 */
function leftArrow(){
    let gameboardArrayBefore = deepCopy(gameboard);
    console.log("-gameboard BEFORE", gameboardArrayBefore);
    displayTextMatrix();

    // Step 1 - Reverse the rows of the gameboard to go left
    let c0 = gameboard[0].slice().reverse();
    let c1 = gameboard[1].slice().reverse();
    let c2 = gameboard[2].slice().reverse();
    let c3 = gameboard[3].slice().reverse();

    let columns = [c0, c1, c2, c3];

    let allAnimations = [];
    let moveScore = 0;
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;
        moveScore += result.score;

        // For LEFT, the input was reversed, so we need to map array positions back to grid positions
        result.animations.forEach(anim => {
            if (anim.value !== undefined && anim.value !== null &&
                anim.from !== undefined && anim.to !== undefined) {
                // When row is reversed: arrayPos 0→gridPos 3, arrayPos 1→gridPos 2, etc.
                // After result.row is reversed back: we need to map the animation coordinates correctly
                // Since we reverse input AND output, the grid positions are: gridPos = 3 - arrayPos
                allAnimations.push({
                    fromIndex: 3 - anim.from,  // Convert from reversed array pos to original grid pos
                    toIndex: 3 - anim.to,      // Convert to reversed array pos to original grid pos
                    rowIndex: i,
                    value: anim.value,
                    merges: anim.merges
                });
            }
        });
    }

    // Update gameboard - reverse back to get correct orientation
    gameboard[0] = columns[0].slice().reverse().map(v => v === undefined || v === null ? 0 : v);
    gameboard[1] = columns[1].slice().reverse().map(v => v === undefined || v === null ? 0 : v);
    gameboard[2] = columns[2].slice().reverse().map(v => v === undefined || v === null ? 0 : v);
    gameboard[3] = columns[3].slice().reverse().map(v => v === undefined || v === null ? 0 : v);
    displayTextMatrix()

    console.log("Left arrow animations:", allAnimations);  // Debug: see what animations we're sending

    executeAnimations(allAnimations, 'left', function() {
        displayGameboard();
        if (action) {
            addRandom();
            currentScore += moveScore;
            moveCount++;
            updateAllStats();
            recordGameState('left', allAnimations);

            if (checkGameOver()) {
                setTimeout(() => showGameOver(), 500);
            }
        }
    });
}

/**
 * generateAnimations - Compare before/after boards and generate animation instructions
 * This is simple: find each non-zero tile in BEFORE, see where it went in AFTER
 */
function generateAnimations(beforeBoard, afterBoard, direction) {
    let animations = [];

    // Process based on direction to handle merges correctly
    if (direction === 'up') {
        // Process each column from top to bottom
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let value = beforeBoard[row][col];
                if (value !== 0) {
                    // Find where this tile ends up
                    let dest = findTileInAfterBoard(afterBoard, row, col, value, direction);
                    if (dest && (dest.row !== row || dest.col !== col)) {
                        animations.push({
                            fromIndex: row,
                            toIndex: dest.row,
                            columnIndex: col,
                            value: value,
                            merges: dest.merged
                        });
                    }
                }
            }
        }
    } else if (direction === 'down') {
        // Process each column from bottom to top
        for (let col = 0; col < 4; col++) {
            for (let row = 3; row >= 0; row--) {
                let value = beforeBoard[row][col];
                if (value !== 0) {
                    let dest = findTileInAfterBoard(afterBoard, row, col, value, direction);
                    if (dest && (dest.row !== row || dest.col !== col)) {
                        animations.push({
                            fromIndex: row,
                            toIndex: dest.row,
                            columnIndex: col,
                            value: value,
                            merges: dest.merged
                        });
                    }
                }
            }
        }
    } else if (direction === 'left') {
        // Process each row from left to right
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let value = beforeBoard[row][col];
                if (value !== 0) {
                    let dest = findTileInAfterBoard(afterBoard, row, col, value, direction);
                    if (dest && (dest.row !== row || dest.col !== col)) {
                        animations.push({
                            fromIndex: col,
                            toIndex: dest.col,
                            rowIndex: row,
                            value: value,
                            merges: dest.merged
                        });
                    }
                }
            }
        }
    } else if (direction === 'right') {
        // Process each row from right to left
        for (let row = 0; row < 4; row++) {
            for (let col = 3; col >= 0; col--) {
                let value = beforeBoard[row][col];
                if (value !== 0) {
                    let dest = findTileInAfterBoard(afterBoard, row, col, value, direction);
                    if (dest && (dest.row !== row || dest.col !== col)) {
                        animations.push({
                            fromIndex: col,
                            toIndex: dest.col,
                            rowIndex: row,
                            value: value,
                            merges: dest.merged
                        });
                    }
                }
            }
        }
    }

    console.log(`Generated ${animations.length} animations for ${direction}`);
    return animations;
}

/**
 * findTileInAfterBoard - Find where a tile from (row,col) with value ended up
 */
function findTileInAfterBoard(afterBoard, row, col, value, direction) {
    if (direction === 'up') {
        // Search upward from original position
        for (let r = 0; r <= row; r++) {
            if (afterBoard[r][col] === value) {
                return { row: r, col: col, merged: false };
            }
            if (afterBoard[r][col] === value * 2) {
                return { row: r, col: col, merged: true };
            }
        }
    } else if (direction === 'down') {
        // Search downward from original position
        for (let r = 3; r >= row; r--) {
            if (afterBoard[r][col] === value) {
                return { row: r, col: col, merged: false };
            }
            if (afterBoard[r][col] === value * 2) {
                return { row: r, col: col, merged: true };
            }
        }
    } else if (direction === 'left') {
        // Search leftward from original position
        for (let c = 0; c <= col; c++) {
            if (afterBoard[row][c] === value) {
                return { row: row, col: c, merged: false };
            }
            if (afterBoard[row][c] === value * 2) {
                return { row: row, col: c, merged: true };
            }
        }
    } else if (direction === 'right') {
        // Search rightward from original position
        for (let c = 3; c >= col; c--) {
            if (afterBoard[row][c] === value) {
                return { row: row, col: c, merged: false };
            }
            if (afterBoard[row][c] === value * 2) {
                return { row: row, col: c, merged: true };
            }
        }
    }
    return null;
}

/**
 * recordGameState - Record the current game state to history
 */
function recordGameState(move, animations = []) {
    const state = {
        board: deepCopy(gameboard),
        move: move,
        animations: animations,
        timestamp: Date.now()
    };
    gameHistory.push(state);
    currentHistoryIndex = gameHistory.length - 1;
    console.log(`📼 Recorded state #${currentHistoryIndex}: ${move}`, state.board);
}

/**
 * replayBackward - Go back one move in history
 */
function replayBackward() {
    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        loadHistoryState(currentHistoryIndex, false); // No animation when going back
        isReplaying = true;
        updateReplayStatus();
        console.log(`⏮️ Replay: Step ${currentHistoryIndex}/${gameHistory.length - 1} - Move: ${gameHistory[currentHistoryIndex].move}`);
    } else {
        console.log("Already at the beginning of history");
    }
}

/**
 * replayForward - Go forward one move in history
 */
function replayForward() {
    if (currentHistoryIndex < gameHistory.length - 1) {
        const previousIndex = currentHistoryIndex;
        currentHistoryIndex++;
        const currentState = gameHistory[currentHistoryIndex];
        const previousState = gameHistory[previousIndex];

        // Use saved animations if available (new system), otherwise fall back to old system
        if (currentState.animations && currentState.animations.length > 0) {
            console.log(`Using saved animations for replay: ${currentState.animations.length} animations`);
            executeAnimations(currentState.animations, currentState.move, function() {
                loadHistoryState(currentHistoryIndex, false);
            });
        } else {
            console.log(`No saved animations, using old animation system`);
            // Fallback to old system for old history entries
            animateTileMovements(previousState.board, currentState.board, currentState.move, function() {
                loadHistoryState(currentHistoryIndex, false);
            });
        }

        isReplaying = true;
        updateReplayStatus();
        console.log(`⏭️ Replay: Step ${currentHistoryIndex}/${gameHistory.length - 1} - Move: ${gameHistory[currentHistoryIndex].move}`);
    } else {
        console.log("At the end of history");
        isReplaying = false;
        updateReplayStatus();
    }
}

/**
 * jumpToStart - Jump to the first state
 */
function jumpToStart() {
    if (gameHistory.length > 0) {
        currentHistoryIndex = 0;
        loadHistoryState(currentHistoryIndex, false);
        isReplaying = true;
        updateReplayStatus();
        console.log(`⏮️⏮️ Jumped to start - Move: ${gameHistory[currentHistoryIndex].move}`);
    }
}

/**
 * jumpToEnd - Jump to the latest state (exit replay mode)
 */
function jumpToEnd() {
    if (gameHistory.length > 0) {
        currentHistoryIndex = gameHistory.length - 1;
        loadHistoryState(currentHistoryIndex, false);
        isReplaying = false;
        updateReplayStatus();
        console.log(`⏭️⏭️ Jumped to end - Back to live game`);
    }
}

/**
 * loadHistoryState - Load a specific state from history
 */
function loadHistoryState(index, animate = false) {
    const state = gameHistory[index];
    gameboard = deepCopy(state.board);
    displayGameboard();
    displayTextMatrix();
}

/**
 * replayMoveWithCurrentLogic - Exit replay mode and continue playing from current position
 * The game board is already at the desired state, just need to exit replay mode
 */
function replayMoveWithCurrentLogic() {
    if (!isReplaying) {
        console.log("Already in live game mode");
        return;
    }

    console.log(`🎮 Exiting replay mode. Continuing game from position ${currentHistoryIndex}`);

    // Simply exit replay mode - the gameboard is already loaded with the correct state
    isReplaying = false;
    updateReplayStatus();

    console.log(`✅ You can now play from this position using arrow keys.`);
}

/**
 * updateReplayStatus - Update the replay status display
 */
function updateReplayStatus() {
    const statusEl = document.getElementById('replayStatus');
    const testBtn = document.getElementById('replayCurrentLogicBtn');

    if (statusEl) {
        if (isReplaying) {
            statusEl.textContent = `📼 Replay Mode: Step ${currentHistoryIndex + 1}/${gameHistory.length} - ${gameHistory[currentHistoryIndex].move}`;
            statusEl.style.color = '#d32f2f';

            // Show test button only if not at start
            if (testBtn && currentHistoryIndex > 0) {
                testBtn.style.display = 'inline-block';
            }
        } else {
            statusEl.textContent = '🟢 Live Game';
            statusEl.style.color = '#388e3c';

            // Hide test button when not in replay mode
            if (testBtn) {
                testBtn.style.display = 'none';
            }
        }
    }
}

/**
 * displayTextMatrix - Display a console log representation of the game board
 */
 function displayTextMatrix() {
    bottomRow = gameboard[3];
    thirdRow  = gameboard[2];
    secondRow = gameboard[1];
    topRow    = gameboard[0];
    console.log("\n   top row", topRow.toString());
    console.log("second row", secondRow.toString());
    console.log(" third row", thirdRow.toString());
    console.log("bottom row", bottomRow.toString(), "\n\n");
}

/**
 * deepCopy - Utility function to make a deep copy of the gameboard without affecting it
 */
function deepCopy(array) {
    let arrayCopy = [[], [], [], []];
    for (let o = 0; o < 4; o++) {
        for (let i = 0; i < 4; i++) {
            // Ensure we copy actual values, not undefined
            arrayCopy[o][i] = (array[o][i] === undefined || array[o][i] === null) ? 0 : array[o][i];
        }
    }
    return arrayCopy;
}

/**
 * addRandom - Add a random number to an open square in the gameboard
 */
function addRandom(){
    // displayTextMatrix();
    // console.log("\ngameboard", gameboard.toString());
    let opensquares = [];
    for(i = 0; i < 4; i++) {
        for(j = 0; j < 4; j++) {
            if(gameboard[i][j] === 0) {
                opensquares.push({
                    x: i,
                    y: j
                })
            }
        }
    }

    if(opensquares.length > 0) {
        // Get a randomSquare from the opensquares dictionary
        let randomSquare =  opensquares[Math.floor(Math.random() * opensquares.length)];
        // get a random number less than 1
        let randNum = Math.random(1);
        let newNum = randNum > 0.5 ? 2 : 4;
        gameboard[randomSquare.x][randomSquare.y] = newNum;
        randomInsert = "gameboard[" + randomSquare.x + "][" + randomSquare.y + "]";

        // This section updates the board view ---------
        // Populate the cell
        let x = randomSquare.x;
        let y = randomSquare.y;
        let targetCell = x.toString() + y.toString();
        let bgColor = returnCellColor(newNum);

        // Add tile with animation - use class selector instead of ID
        let divboard = [['a','b','c','d'], ['e','f','g','h'], ['i','j','k','l'], ['m','n','o','p']];
        let divClass = divboard[x][y];
        let cellDiv = $('.'+divClass);
        cellDiv.text(newNum).css("background-color", bgColor);
        cellDiv.addClass('tile-new');
        // Remove animation class after animation completes
        setTimeout(function() {
            cellDiv.removeClass('tile-new');
        }, 200);
        // ---------------------------------------------

    }
}

/**
 * returnCellColor - Utility function for CSS game coloring
 */
function returnCellColor(value) {
    const cellColorMap = {
        0: '#ccc',
        2: 'white',
        4: '#FFFDE7',
        8: '#FF9E80',
        16: '#FF8A65',
        32: '#FF5722',
        64: '#FFC107',
        128: '#C0CA33',
        256: '#464913ff',
        512: '#232004ff',
        1024: '#4596cbff',
        2048: '#222be3ff'
    };
    return cellColorMap[value] || '#ccc'; // Default to #ccc if value not found
}


/**
 * displayGameboard - Display the JS gameboard in the HTML/CSS grid
 * Updated to only change tiles that have different values to prevent flickering
 */
function displayGameboard() {
    // let gameboard = [[0,4,2,2], [0,0,0,0], [2,0,0,0], [2,0,0,0]];
    let divboard = [['a','b','c','d'], ['e','f','g','h'], ['i','j','k','l'], ['m','n','o','p']];

    // o = outer; i = inner
    for (let o = 0; o < 4; o++) {
        for (let i = 0; i < 4; i++) {
            let value = gameboard[o][i];
            let div = divboard[o][i];
            let cellDiv = $('.'+div);
            // console.log(div, value);
            let bgColor = returnCellColor(value);
            let text = value;
            if (value === 0) { text = ''; }

            // Only update if the value changed to prevent flickering
            if (cellDiv.text() != text) {
                cellDiv.text(text);
            }
            if (cellDiv.css("background-color") != bgColor) {
                cellDiv.css("background-color", bgColor);
            }
        }
    }
}

/**
 * exportGameHistory - Export game history to a JSON file
 */
function exportGameHistory() {
    const data = JSON.stringify({
        history: gameHistory,
        currentIndex: currentHistoryIndex,
        exportDate: new Date().toISOString()
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2048-game-history-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📥 Game history exported:', gameHistory.length, 'states');
}

/**
 * importGameHistory - Import game history from a JSON file
 */
function importGameHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                gameHistory = data.history;
                currentHistoryIndex = data.currentIndex;

                // Load the current state
                loadHistoryState(currentHistoryIndex, false);
                isReplaying = true;
                updateReplayStatus();

                console.log('📤 Game history imported:', gameHistory.length, 'states');
                console.log('Loaded state from:', new Date(data.exportDate).toLocaleString());
            } catch (err) {
                console.error('Failed to import game history:', err);
                alert('Failed to import game history. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * checkGameOver - Check if no moves are possible
 */
function checkGameOver() {
    // First check if there are any empty spaces
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (gameboard[row][col] === 0) {
                return false; // Can still play
            }
        }
    }

    // Check for possible merges horizontally
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            if (gameboard[row][col] === gameboard[row][col + 1]) {
                return false; // Can merge
            }
        }
    }

    // Check for possible merges vertically
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            if (gameboard[row][col] === gameboard[row + 1][col]) {
                return false; // Can merge
            }
        }
    }

    return true; // No moves possible
}

/**
 * showGameOver - Display game over overlay
 */
function showGameOver() {
    isGameOver = true;
    $('#finalScore').text('Final Score: ' + currentScore);
    $('#gameOverOverlay').fadeIn(300);
}

/**
 * resetGame - Reset the game to initial state
 */
function resetGame() {
    // Reset game state
    gameboard = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    gameHistory = [];
    currentHistoryIndex = -1;
    isReplaying = false;
    isGameOver = false;
    currentScore = 0;
    moveCount = 0;

    // Hide game over overlay
    $('#gameOverOverlay').fadeOut(300);

    // Clear and redisplay board
    displayGameboard();
    updateAllStats();

    // Add initial tiles
    addRandom();
    addRandom();

    // Update score after initial tiles (should be 0 since no merges yet)
    currentScore = 0;
    updateAllStats();

    // Record initial state
    recordGameState('init');
}

/**
 * getHighestTile - Find the highest tile value on the board
 */
function getHighestTile() {
    let highest = 0;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (gameboard[row][col] > highest) {
                highest = gameboard[row][col];
            }
        }
    }
    return highest;
}

/**
 * updateAllStats - Update all stat displays
 */
function updateAllStats() {
    // Update score
    $('#currentScore').text(currentScore);

    // Update move count
    $('#moveCount').text(moveCount);

    // Update best score
    if (currentScore > bestScore) {
        bestScore = currentScore;
        localStorage.setItem('2048-bestScore', bestScore);
    }
    $('#bestScore').text(bestScore);

    // Update highest tile
    $('#highestTile').text(getHighestTile());

    // Update PPM (Points Per Move)
    let ppm = moveCount > 0 ? Math.round(currentScore / moveCount) : 0;
    $('#ppm').text(ppm);
}

/**
 * updateMoveCount - Update the move counter display
 */
function updateMoveCount() {
    $('#moveCount').text(moveCount);
}

/**
 * updateScoreDisplay - Update the score display in the UI
 */
function updateScoreDisplay() {
    $('#currentScore').text(currentScore);
}

