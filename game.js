let gameboard = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
let divLookup = [['a','e','i','m'], ['b','f','j','n'], ['c','g','k','o'], ['d','h','l','p']]
let action = 1;
let gameboardBefore = ""; // Make this global
// Replay system
let gameHistory = [];
let currentHistoryIndex = -1;
let isReplaying = false;

// TODO: Algorithm is failing at this point: Middle numbers won't combine.
// For example [8, 4, 4, 2] or [4, 8, 8, 2]

// Add first two numbers to the board
addRandom();
addRandom();
// Record initial state
recordGameState('init');

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

  // Don't allow moves during replay
  if (isReplaying) {
      console.log("Cannot make moves during replay. Press End to return to live game.");
      return;
  }

  switch (e.key) {
      case 'ArrowUp':
          upArrow();
          console.table("Up arrow");
          break;
      case 'ArrowDown':
          downArrow();
          console.table("Down arrow");
          break;
      case 'ArrowLeft':
          leftArrow();
          console.table("Left arrow");
          break;
      case 'ArrowRight':
          rightArrow();
          console.table("Right arrow");
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
    let animations = []; // Track animations in terms of array indices (0-3)

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
    return { row: row, animations: animations };
}

/**
 * executeAnimations - Execute animations based on recorded moves from rowTransform
 */
function executeAnimations(animationInstructions, direction, callback) {
    let divboard = [['a','b','c','d'], ['e','f','g','h'], ['i','j','k','l'], ['m','n','o','p']];
    let animationDuration = 1000;
    let animationsCompleted = 0;
    let totalAnimations = animationInstructions.length;

    if (totalAnimations === 0) {
        callback();
        return;
    }

    console.log(`Executing ${totalAnimations} animations for ${direction} direction`);

    animationInstructions.forEach((anim, index) => {
        // Validate animation data before processing
        if (!anim || anim.value === undefined || anim.value === null) {
            console.warn(`Skipping invalid animation at index ${index}:`, anim);
            animationsCompleted++;
            if (animationsCompleted === totalAnimations) {
                callback();
            }
            return;
        }

        let fromRow, fromCol, toRow, toCol;

        // Convert line/column indices to grid positions based on direction
        if (direction === 'up' || direction === 'down') {
            // Column-based movement
            if (anim.columnIndex === undefined || anim.fromIndex === undefined || anim.toIndex === undefined) {
                console.warn(`Skipping animation with missing column data:`, anim);
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
            // Row-based movement (left/right)
            if (anim.rowIndex === undefined || anim.fromIndex === undefined || anim.toIndex === undefined) {
                console.warn(`Skipping animation with missing row data:`, anim);
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

        console.log(`Animation ${index + 1}: Tile at (${fromRow},${fromCol}) value ${anim.value} ${anim.merges ? 'merges' : 'moves'} to (${toRow},${toCol})`);

        cellDiv.css('z-index', '10');
        cellDiv.css('transition', `transform ${animationDuration}ms ease-in-out`);
        cellDiv.css('transform', `translate(${translateX}px, ${translateY}px)`);

        setTimeout(() => {
            cellDiv.css('transition', '');
            cellDiv.css('transform', '');
            cellDiv.css('z-index', '5');
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

                    console.log(`Animating tile at (${row},${col}) value ${value} to (${newPos.row},${newPos.col}) - moving ${translateX}px, ${translateY}px`);

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
    console.log("columns", columns);

    let allAnimations = [];
    for(let i = 0; i < columns.length; i++){
        console.log("---- Line to be tested: ", columns[i]);
        let result = rowTransform(columns[i]);
        columns[i] = result.row;
        console.log("---- Line after transform: ", columns[i]);

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
            recordGameState('up', allAnimations);
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
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;

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
            recordGameState('down', allAnimations);
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
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;

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
            recordGameState('right', allAnimations);
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
    for(let i = 0; i < columns.length; i++){
        let result = rowTransform(columns[i]);
        columns[i] = result.row;

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
            recordGameState('left', allAnimations);
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
    console.log("How many open squares?", opensquares.length-1)

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
































/** ------    UNUSED FUNCTIONS BELOW    ------ */
/**
 * combineLastTwo - Used by the rowTransform algorithm.
 *  If the last two numbers match, combine them.
 *
*/
function combineLastTwo(arr) {
    let last = arr.length - 1;
    let secondToLast = last - 1;
    if(arr[secondToLast] === arr[last]) {
        arr[secondToLast] = arr[last] *2;
        arr.pop();
    }
    return arr;
}

/**
 * emptyColumn - Function may not be used anymore
 */
function emptyColumn(column) {
    let colMax = Math.max.apply(null, column);
    if(colMax === 0) return true;
    return false;
}

/**
 * determineMoves - No longer used. Kept for examples of how to set animations
 */
function determineMoves(oc) {
    // console.log("------------------------------ oc -------------------------------------");
    // Returns the first available move
    let arr = [];    // scratch array
    for(k = 0; k < oc.length; k++) {
        arr.push(oc[k]);
    }
    // console.log("Scratch array", arr);

    let animationInstructions = [];
    let moves = {};
    // let nc = [0,0,0,0];
    let nc = oc;
    nc[0] = arr[0];     // copy the first index of arr into nc
    let moveSpaces = 0;
    let transform = '';
    let cellValue = '';
    let action = 0;
    let alreadyMoved = 0;
    let alreadyTransformed = '';
    for (k = 0; k < arr.length; k++) {
        // console.log("\nCurrent index:", k);
        if (arr[k] === 0) {
        moveSpaces++;
        action = 1;
        } else {        // have arrived at at non-zero number
        if (k > 0) {  // if not first index (skip first index since we know it can't move)

            let destinationCell = k - moveSpaces;
            // console.log('destinationCell', destinationCell);
            if(destinationCell > 0) {   // if not the first cell
            let destCelllMinusOne = destinationCell - 1;
            let priorCell = arr[destCelllMinusOne];

            // Prevent the case where 2+2 was already transformed into 4 such that this 4 is not used
            // to further combine with a 4 later in the array.
            // A transformed number should not be used in another transform in the same loop.
            // [4,2,2,4] should end up with [4,4,4,0], not [4,8,0,0]
            // && !(destCelllMinusOne === alreadyTransformed)

            // console.log('priorCell arr[k]', priorCell, arr[k]);
            if (priorCell === arr[k] && !(destCelllMinusOne === alreadyTransformed)){    // they are equal, so we can add them together
                transform = priorCell + arr[k];
                moveSpaces++;
                action = 1;
                alreadyTransformed = k - moveSpaces;  // store the index of the transform
                nc[k - moveSpaces] = transform;
                arr[k - moveSpaces] = transform;
                arr[k] = 0;  // set this value to zero sinse a value was just moved out of it.
                nc[k] = 0;  // set this value to zero sinse a value was just moved out of it.
                // console.log("Scratch array", arr);
                // console.log("nc after add", nc);
                moves['moveSpaces'] = moveSpaces;
                moves['index'] = k;
                moves['transform'] = transform;
                moves['cellValue'] = transform;
                moves['nc'] = nc;
                animationInstructions.push(moves);
                moves = {};
            } else {
                // if there is just a move, but no transform, then move the unchanged value to the new index

                if (moveSpaces > 0) {
                    console.log("1.Moving", k, "value", arr[k], "up", moveSpaces, "spaces.");
                    nc[k - moveSpaces] = arr[k];
                    arr[k - moveSpaces] = arr[k]
                    cellValue = arr[k];
                    arr[k] = 0;  // set this value to zero sinse a value was just moved out of it.
                    nc[k] = 0;  // set this value to zero sinse a value was just moved out of it.
                    // console.log("Scratch array", arr, "nc", nc);
                    moves['moveSpaces'] = moveSpaces;
                    moves['index'] = k;
                    moves['transform'] = '';
                    moves['cellValue'] = cellValue;
                    moves['nc'] = nc;
                    animationInstructions.push(moves);
                    moves = {};
                    alreadyMoved = 1;

                    if (k === 3) {    // We're done. Let's exit.
                        if (action === 1) {   // return moves only if there is a move
                        console.log('animation instructions', animationInstructions)
                        return animationInstructions;
                        }
                    }
                }

            }
            }

            if (! transform && alreadyMoved < 1 && moveSpaces > 0) {   // if there is just a move, but no transform, then move the unchanged value to the new index
                console.log("2.Moving", k, "value", arr[k], "up", moveSpaces, "spaces.");
                nc[k - moveSpaces] = arr[k];
                arr[k - moveSpaces] = arr[k]
                cellValue = arr[k];
                arr[k] = 0;  // set this value to zero sinse a value was just moved out of it.
                nc[k] = 0;  // set this value to zero sinse a value was just moved out of it.
                // console.log("Scratch array", arr);
                moves['moveSpaces'] = moveSpaces;
                moves['index'] = k;
                moves['transform'] = '';
                moves['cellValue'] = cellValue;
                moves['nc'] = nc;
                animationInstructions.push(moves);
                moves = {};
            }
        }
        }
    }
    if (action === 1) {   // return moves only if there is a move
        console.log('animation instructions', animationInstructions)
        return animationInstructions;
    }
}

/**
 * sortColumnUp - No longer used. Kept for examples of how to set animations
 *   Idea: Store up all four columns before calling slideVertical
 *   Make 4 concurrent calls to slideVertical, without iteration
 */
function sortColumnUp(column,col) {
    console.log("sortColumnUp", column,col)
    let originalColumn = [];
    for(k = 0; k < column.length; k++) {
        originalColumn.push(column[k]);
    }

    let oc = originalColumn;     // original column
    // let sc = column;          // scratch column
    let nc = [0,0,0,0];          // new (updated) column

    // oc = [ 0, 2, 2, 2 ] ends up giving me [ 4, 2, 0, 2 ]
    // oc = [ 2, 2, 2, 2 ];

    // console.log("oc", oc);
    // console.log("nc", nc);


    if(emptyColumn(column)) {
        console.log("All zeroes, so skipping analysis.");
    } else {
        let animationInstructions = determineMoves(oc);
        moves = animationInstructions[animationInstructions.length-1];
        if (moves) {

        // console.log("Moves", moves);
        // console.log("  nc", moves.nc);
        nc = moves.nc; //enable this line when it is working..
        // Update gameboard with new column
        gameboard[0][col] = nc[0];
        gameboard[1][col] = nc[1];
        gameboard[2][col] = nc[2];
        gameboard[3][col] = nc[3];
        // console.log('animationInstructions:')
        for(r = 0; r < animationInstructions.length; r++){
            // console.log(animationInstructions[r]);
            let numSpaces = animationInstructions[r].moveSpaces;
            let textTransform = animationInstructions[r].transform;
            let cellValue = animationInstructions[r].cellValue;
            let index = animationInstructions[r].index;
            let div = divLookup[col][index];
            if(textTransform) {
            textTransform = textTransform;
            } else {
            textTransform = cellValue;
            }
            slideVertical(numSpaces, 'u', textTransform, div);
        }
        } else {
        console.log('No moves! (sortColumnUp)')
        }
    }
    return nc;
}

/**
 * sortColumnDown - No longer used. Kept for examples of how to set animations
 */
function sortColumnDown(column,col,colDivs) {
    // let currentColumn = "c" + col.toString();

    // Need to keep track of divs also, for animation. For example column 0 os a,e,i,m
    // Need to keep track of each of a, e, i, m => how many spaces each moved and what their new values are

    // moveInstructions = [div,numberOfSpaces,textTransform]
    let moveInstructions = ['','','']

    let c1 = column;
    let nc = [0,0,0,0]; // new column
    for(i = 3; i >= 1; i--) {
        let div = colDivs[i];
        console.log("Current div: ", div);
        bottom = c1[i];
        oneAbove = c1[i-1];
        if (bottom === 0){
        moveInstructions = [div, 0, 0];
        }

        if ( c1[i] === c1[i-1] && c1[i] != 0) { // match, so add
            nc[i] = c1[i]+c1[i-1];
            nc[i-1] = 0;
            c1[i-1] = 0;
            console.log("-case1-", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i]", nc[i], "nc[i-1]", nc[i-1], "nc", nc.toString(), "c1", c1.toString(), "Match. Add. Replace cell with 0.");
        }
        else if ( c1[i] === 0 ){ // c is empty, so move n to it
            nc[i] = c1[i-1];
            nc[i-1] = 0;
            c1[i-1] = 0;
            console.log("-case2-", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i]", nc[i], "nc[i-1]", nc[i-1], "nc", nc.toString(), "c1", c1.toString(), "Move up one.");
            if(nc[i+1] === 0){  // move up 1 more place in the column
                nc[i+1] = nc[i];
                nc[i] = 0;
                console.log("-case2.1", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i+1]", nc[i+1], "nc[i-1]", nc[i-1], "nc", nc.toString(), "c1", c1.toString(), "Move up one.");
                // After the number moved, check if there is a match
            if ( nc[i+1] === nc[i+2] ){
                nc[i+2] = nc[i+1]+nc[i+2];
                nc[i+1] = 0;
                console.log("-case2.1.3", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i-1]", nc[i-1], "nc[i-2]", nc[i-2], "nc", nc.toString(), "c1", c1.toString(), "Done moving. Match. Add.");
            }
            }
            if(nc[i+2] === 0){ // move up 1 more place in the column again
                nc[i+2] = nc[i+1];
                nc[i+1] = 0;
                console.log("-case2.2", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i-2]", nc[i-2], "nc[i-3]", nc[i-3], "nc", nc.toString(), "c1", c1.toString(), "Move up one.");
                // After the number moved, check if there is a match
            if ( nc[i+2] === nc[i+3] ){
                nc[i+3] = nc[i+2]+nc[i+3];
                nc[i+2] = 0;
                console.log("-case2.2.3", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i-2]", nc[i-2], "nc[i-3]", nc[i-3], "nc", nc.toString(), "c1", c1.toString(), "Done moving. Match. Add.");
            }
            }
            // After the number moved, check if there is a match
            if ( nc[i] === nc[i+1] ){
                nc[i+1] = nc[i]+nc[i+1];
                nc[i] = 0;
                console.log("-case2.3", "bottom", bottom, "oneAbove", oneAbove,  i, "nc[i]", nc[i], "nc[i-1]", nc[i-1], "nc", nc.toString(), "c1", c1.toString(), "Done moving. Match. Add.");
            }

        }
        else {   // do nothing
            nc[i] = c1[i];
            nc[i-1] = c1[i-1];
            console.log("-case3-", "bottom", bottom, "oneAbove", oneAbove, "i",  i, "nc[i]", nc[i], "nc[i-1]", nc[i-1], "nc", nc.toString(), "c1", c1.toString(), "Do nothing.");
        }
        console.log('moveInstructions', moveInstructions)
    }
    console.log("The changed column is: ", nc);
    console.log(nc[0], nc[1], nc[2], nc[3]);

    // Update gameboard with new column
    gameboard[0][col] = nc[0];
    gameboard[1][col] = nc[1];
    gameboard[2][col] = nc[2];
    gameboard[3][col] = nc[3];
    // console.log("-~gameboard", gameboard.toString());
    // displayGameboard();
    return nc;
}

/**
 * returnCount - Utility function not used.. Keeping until I can remember what it was for
 */
function returnCount(arrayToCheck, element){
    let array = arrayToCheck;
    let elementToFind = element;
    let numberFound = array.filter(x => x === elementToFind).length;
    return numberFound;
}

/**
 * slideHorizontal - Utility function for CSS game animations
 */
function slideHorizontal(numSpaces, direction, textTransform, div) {
    let o = "";
    if (direction === 'l') o = '-=';
    if (direction === 'r') o = '+=';
    let numberOfSpaces = parseInt(numSpaces);
    let cellWidth = 125;
    let moveDistance = numberOfSpaces * cellWidth;
    let moveInstruction = o + moveDistance.toString();
    let targetDiv = '.' + div;
    let bgColor = returnCellColor(textTransform);
    $(targetDiv).animate({
        left: moveInstruction
        }, 155, 'linear');

    $(targetDiv).delay(1).queue(function(f) {
        $(this).text(textTransform).css("background-color", bgColor); f();
    });
}

/**
 * slideVertical - Utility function for CSS game animations
 *  Make this function so that it animates 4 columns at a time, without iterating through columns
 *  It should take in an array of 4 columns, each with its own arguments
 *  OR
 *  just call this function 4 times in parallel
 */
function slideVertical(numSpaces, direction, textTransform, div) {
    // div is the class cell to be moved
    console.log("Entering slideVertical:", numSpaces, direction, textTransform, div);
    let o = "";
    if (direction === 'u') o = '-=';
    if (direction === 'd') o = '+=';
    let numberOfSpaces = parseInt(numSpaces);
    let cellWidth = 125;
    let moveDistance = numberOfSpaces * cellWidth;
    let moveInstruction = o + moveDistance.toString();
    let targetDiv = '.' + div;
    let bgColor = returnCellColor(textTransform);
    let speed = 155;
    $(targetDiv).animate({
        top: moveInstruction
        }, speed, 'linear');
    $(targetDiv).delay(1).queue(function(f) {
        $(this).text(textTransform).css("background-color", bgColor); f();
    });
}