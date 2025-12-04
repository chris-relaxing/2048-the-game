let gameboard = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
let divLookup = [['a','e','i','m'], ['b','f','j','n'], ['c','g','k','o'], ['d','h','l','p']]
let action = 1;
let gameboardBefore = ""; // Make this global

// TODO: Algorithm is failing at this point: Middle numbers won't combine. 
// For example [8, 4, 4, 2] or [4, 8, 8, 2]

// Add first two numbers to the board
addRandom();
addRandom();

document.onkeydown = function (e) {
  switch (e.key) {
      case 'ArrowUp':
          // up arrow
          // console.table("Up arrow");
          console.log("Up arrow ---------------------------------------------------------------------------");

          upArrow();
          displayGameboard();
          if (action) { addRandom(); }

          break;
      case 'ArrowDown':
          // down arrow
          console.table("Down arrow");

          downArrow();
          displayGameboard();
          if (action) { addRandom(); }
          break;
      case 'ArrowLeft':
          // left arrow
          console.table("Left arrow");
          leftArrow();
          displayGameboard();
          if (action) { addRandom(); }
          break;
      case 'ArrowRight':
          // right arrow
          console.table("Right arrow");
          rightArrow();
          displayGameboard();
          if (action) { addRandom(); }
          break;
  }
};

/**
* removeZeros - This function returns a given array with all zeros removed.
*/
function removeZeros(arr) {
    for(var i=0; i < arr.length; i++) {
        if(arr[i] === 0) {
            arr.splice(i, 1);
            i--;
        }
    }
    // console.log("Array without zeros being returned: ", arr);
    return arr;
}

/**
* padZeros - All rows should have a length of 4. So this function will
*   pad zeros on the left side until the length of the array is 4
*/
function padZeros(arr) {
    // Determine current length of row to pad zeros
    let short = 4 - arr.length;
    // console.log("The current row is short by: ", short);
    for(x = 0; x < short; x++) {
        arr.unshift(0);
    }
return arr;
}


function rowTransform(row) {
    const originalRow = [...row];

    // Before the below, let's remove all zeros, then we will see how many digits remain
    row = removeZeros(row);

    // Case of 4 numbers in a row with no zeros
    // Pre-process the cases where there is more than one potential combine. i.e. [4,4,4,4]
    // If there are no zeroes in the row, then we could have more than one combine that needs to happen
    // ------------------------------
    if(row.length === 4) {
    // if(!row.includes(0)) {
        // console.log("This is the length===4 case..BEFORE", row);

        // Step 1 - Combines
        // Combine the last two numbers, if possible
        // TO DO: Generalize this so that the indexes are calculated to be the last index
        if(row[2] === row[3]) {
            row[2] = row[3] *2;
            row.pop();
        }
        // row = combineLastTwo(row);

        // Combine the middle two numbers, if possible
        else if(row[1] === row[2]) {
            row[2] = row[1] *2;
            row[1] = row[0];
            row.shift();
        }

        // Combine the first two numbers, if possible
        else if(row[0] === row[1]) {
            row[1] = row[1] *2;
            row.shift();
        }

        // Step 2 - Pad zeros
        row = padZeros(row);
        console.log(originalRow, "row after Step 2: ", row);
    }
    // ------------------------------
    if(row.length === 3) {
        // console.log("This is the length===3 case..BEFORE", row);
        // Step 1 - Combines
        // Combine the last two numbers, if possible
        if(row[1] === row[2]) {
            row[1] = row[2] *2;
            row.pop();
        // console.log("This is the target case..AFTER", row);
        }
        // Combine the first two numbers, if possible
        else if(row[0] === row[1]) {
            row[1] = row[1] *2;
            row[0] = 0;
        }
        // console.log("This is the target case..AFTER", row);

        // Step 2 - Pad zeros
        row = padZeros(row);
        console.log(originalRow, "row after Step 2: ", row);

    }
    // ------------------------------
    if(row.length === 2) {
        // console.log("This is the length===2 case..BEFORE", row);
        if(row[0] === row[1]) {
            row[0] = row[1] *2;
            row.pop();
        // console.log("This is the target case..AFTER", row);
        }
        // Step 2 - Pad zeros
        row = padZeros(row);
        console.log(originalRow, "row after Step 2: ", row);
    }
    // ------------------------------
    if(row.length === 1) {
        // console.log("This is the length===2 case..BEFORE", row);
        row = padZeros(row);
        console.log(originalRow, "row after Step 2: ", row);
    }
    console.log("Transformed row: ", padZeros(row));
    // return row;
}

function upArrow() {

    // Step 1 - Load the column into an array
    // let c1 = [topRow[0], secondRow[0], thirdRow[0], bottomRow[0]];
    let c0 = [gameboard[3][0], gameboard[2][0], gameboard[1][0], gameboard[0][0]];
    let c1 = [gameboard[3][1], gameboard[2][1], gameboard[1][1], gameboard[0][1]];
    let c2 = [gameboard[3][2], gameboard[2][2], gameboard[1][2], gameboard[0][2]];
    let c3 = [gameboard[3][3], gameboard[2][3], gameboard[1][3], gameboard[0][3]];

    let gameboardArrayBefore = deepCopy(gameboard);
    gameboardBefore = gameboard.slice().toString(); // shallow text copy of the array
    console.log("-gameboard BEFORE", gameboardBefore, gameboardArrayBefore);

    let columns = [c0, c1, c2, c3];
    console.log("columns", columns);


    for(line of columns){
        console.log("---- Line to be tested: ", line);
        rowTransform(line);
    }

    // Update gameboard with new column
    gameboard[3] = [columns[0][0], columns[1][0], columns[2][0], columns[3][0]];
    gameboard[2] = [columns[0][1], columns[1][1], columns[2][1], columns[3][1]];
    gameboard[1] = [columns[0][2], columns[1][2], columns[2][2], columns[3][2]];
    gameboard[0] = [columns[0][3], columns[1][3], columns[2][3], columns[3][3]];
    displayTextMatrix()

    let gameboardArrayAfter = deepCopy(gameboard);
    let gameboardAfter = gameboard.slice().toString(); // shallow copy
    console.log("-gameboard AFTER", gameboardAfter, gameboardArrayAfter);

    // if (gameboardBefore === gameboardAfter) {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER", gameboardAfter);
    //   console.log("!! NO ACTION !!");
    //   addRandom();
    //   action = 0;
    // } else {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER",  gameboardAfter);
    //   console.log("ACTION!");
    //   action = 1;
    // }

    displayGameboard()
}

function downArrow(){
    displayTextMatrix();

    // Step 1 - Load the column into an array
    // let c1 = [topRow[0], secondRow[0], thirdRow[0], bottomRow[0]];
    let c0 = [gameboard[0][0], gameboard[1][0], gameboard[2][0], gameboard[3][0]];
    let c1 = [gameboard[0][1], gameboard[1][1], gameboard[2][1], gameboard[3][1]];
    let c2 = [gameboard[0][2], gameboard[1][2], gameboard[2][2], gameboard[3][2]];
    let c3 = [gameboard[0][3], gameboard[1][3], gameboard[2][3], gameboard[3][3]];

    let gameboardArrayBefore = deepCopy(gameboard);
    gameboardBefore = gameboard.slice().toString(); // shallow text copy of the array
    console.log("-gameboard BEFORE", gameboardBefore, gameboardArrayBefore);

    let columns = [c0, c1, c2, c3];
    console.log("columns", columns);


    for(line of columns){
        console.log("---- Line to be tested: ", line);
        rowTransform(line);
    }

    // Update gameboard with new column
    gameboard[0] = [columns[0][0], columns[1][0], columns[2][0], columns[3][0]];
    gameboard[1] = [columns[0][1], columns[1][1], columns[2][1], columns[3][1]];
    gameboard[2] = [columns[0][2], columns[1][2], columns[2][2], columns[3][2]];
    gameboard[3] = [columns[0][3], columns[1][3], columns[2][3], columns[3][3]];
    displayTextMatrix()

    let gameboardArrayAfter = deepCopy(gameboard);
    let gameboardAfter = gameboard.slice().toString(); // shallow copy
    console.log("-gameboard AFTER", gameboardAfter, gameboardArrayAfter);

    // if (gameboardBefore === gameboardAfter) {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER", gameboardAfter);
    //   console.log("!! NO ACTION !!");
    //   addRandom();
    //   action = 0;
    // } else {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER",  gameboardAfter);
    //   console.log("ACTION!");
    //   action = 1;
    // }

    displayGameboard();
}

function rightArrow(){
    displayTextMatrix();

    // Step 1 - Load the column into an array
    // let c1 = [topRow[0], secondRow[0], thirdRow[0], bottomRow[0]];
    // let c0 = [gameboard[0][0], gameboard[1][0], gameboard[2][0], gameboard[3][0]];
    // let c1 = [gameboard[0][1], gameboard[1][1], gameboard[2][1], gameboard[3][1]];
    // let c2 = [gameboard[0][2], gameboard[1][2], gameboard[2][2], gameboard[3][2]];
    // let c3 = [gameboard[0][3], gameboard[1][3], gameboard[2][3], gameboard[3][3]];

    let gameboardArrayBefore = deepCopy(gameboard);
    gameboardBefore = gameboard.slice().toString(); // shallow text copy of the array
    console.log("-gameboard BEFORE", gameboardBefore, gameboardArrayBefore);

    let columns = gameboard;
    console.log("columns", columns);


    for(line of columns){
        console.log("---- Line to be tested: ", line);
        rowTransform(line);
    }

    // Update gameboard with new column
    // gameboard[0] = [columns[0][0], columns[1][0], columns[2][0], columns[3][0]];
    // gameboard[1] = [columns[0][1], columns[1][1], columns[2][1], columns[3][1]];
    // gameboard[2] = [columns[0][2], columns[1][2], columns[2][2], columns[3][2]];
    // gameboard[3] = [columns[0][3], columns[1][3], columns[2][3], columns[3][3]];
    displayTextMatrix()

    let gameboardArrayAfter = deepCopy(gameboard);
    let gameboardAfter = gameboard.slice().toString(); // shallow copy
    console.log("-gameboard AFTER", gameboardAfter, gameboardArrayAfter);

    // if (gameboardBefore === gameboardAfter) {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER", gameboardAfter);
    //   console.log("!! NO ACTION !!");
    //   addRandom();
    //   action = 0;
    // } else {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER",  gameboardAfter);
    //   console.log("ACTION!");
    //   action = 1;
    // }

    displayGameboard()
}

function leftArrow(){
    displayTextMatrix();

    // Step 1 - Reverse the rows of the gameboard to go left
    let c0 = gameboard[0].reverse();
    let c1 = gameboard[1].reverse();
    let c2 = gameboard[2].reverse();
    let c3 = gameboard[3].reverse();

    console.log("c0", c0);
    console.log("c1", c1);
    console.log("c2", c2);
    console.log("c3", c3);

    let columns = [c0, c1, c2, c3];
    console.log("columns", columns);

    let gameboardArrayBefore = deepCopy(gameboard);
    gameboardBefore = gameboard.slice().toString(); // shallow text copy of the array
    console.log("-gameboard BEFORE", gameboardBefore, gameboardArrayBefore);

    for(line of columns){
        console.log("---- Line to be tested: ", line);
        rowTransform(line);
    }

    // Update gameboard with new column
    gameboard[0] = columns[0].reverse();
    gameboard[1] = columns[1].reverse();
    gameboard[2] = columns[2].reverse();
    gameboard[3] = columns[3].reverse();
    displayTextMatrix()

    let gameboardArrayAfter = deepCopy(gameboard);
    let gameboardAfter = gameboard.slice().toString(); // shallow copy
    console.log("-gameboard AFTER", gameboardAfter, gameboardArrayAfter);

    // if (gameboardBefore === gameboardAfter) {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER", gameboardAfter);
    //   console.log("!! NO ACTION !!");
    //   addRandom();
    //   action = 0;
    // } else {
    //   // console.log("-gameboard BEFORE", gameboardBefore);
    //   // console.log("-gameboard AFTER",  gameboardAfter);
    //   console.log("ACTION!");
    //   action = 1;
    // }

    displayGameboard()
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
        arrayCopy[o][i] = array[o][i];
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
    // console.log("opensquares contains:", opensquares.length);
    // for(let b = 0; b < opensquares.length; b++){
    //   console.log(opensquares[b]);
    // }
    // console.log("opensquares", opensquares.toString());

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
    // action = 0;
    console.table(gameboard);
}

/**
 * returnCellColor - Utility function for CSS game coloring
 */
function returnCellColor(value) {
    let cellColors = ['#ccc', 'white', '#FFFDE7', '#FF9E80', '#FF8A65', '#FF5722', '#FFC107', '#C0CA33'];
    let cellValues = [0, 2, 4, 8, 16, 32, 64, 128];
    let bgColor = cellColors[cellValues.indexOf(value)];
    return bgColor;
}


/**
 * displayGameboard - Display the JS gameboard in the HTML/CSS grid
 */
function displayGameboard() {
    // let gameboard = [[0,4,2,2], [0,0,0,0], [2,0,0,0], [2,0,0,0]];
    let divboard = [['a','b','c','d'], ['e','f','g','h'], ['i','j','k','l'], ['m','n','o','p']];

    $(document).ready(function(){
        // o = outer; i = inner
        for (let o = 0; o < 4; o++) {
        for (let i = 0; i < 4; i++) {
            let value = gameboard[o][i];
            let div = divboard[o][i];
            // console.log(div, value);
            let bgColor = returnCellColor(value);
            let text = value;
            if (value === 0) { text = ''; }
            $('.'+div).text(text).css("background-color", bgColor);
        }
        }
    });
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


