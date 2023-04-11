const width = 10
const previewWidth = 4
const grid = document.querySelector('.grid')
const previewSquares = document.querySelectorAll('div.preview-grid div')
const holdSquares = document.querySelectorAll('div.hold-grid div')
const linesDisplay = document.querySelector('#lines')
const levelDisplay = document.querySelector('#level')
const startBtn = document.querySelector('#play-button')
let squares = Array.from(document.querySelectorAll('.grid div'))

const jPiece = [
    [0, width, width+1, width+2],
    [1, 2, width+1, width*2+1],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2, width*2+1]
]

const lPiece = [
    [2, width, width+1, width+2],
    [1, width+1, width*2+1, width*2+2],
    [width, width+1, width+2, width*2],
    [0, 1, width+1, width*2+1]
]

const sPiece = [
    [1, 2, width, width+1],
    [1, width+1, width+2, width*2+2],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
]

const zPiece = [
    [0, 1, width+1, width+2],
    [2, width+1, width+2, width*2+1],
    [width, width+1, width*2+1, width*2+2],
    [1, width, width+1, width*2],
]

const tPiece = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
]

const oPiece = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
] 

const iPiece = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [2, width+2, width*2+2, width*3+2],
    [width*2, width*2+1, width*2+2, width*2+3]
]

const previewPieces = [
    [0, previewWidth, previewWidth+1, previewWidth+2],
    [2, previewWidth, previewWidth+1, previewWidth+2],
    [1, 2, previewWidth, previewWidth+1],
    [0, 1, previewWidth+1, previewWidth+2],
    [1, previewWidth, previewWidth+1, previewWidth+2],
    [0, 1, previewWidth, previewWidth+1],
    [0, 1, 2, 3],
]

const spawnPos = [3, 3, 3, 3, 3, 4, 4]
const colours = ['pieceBlue', 'pieceOrange', 'pieceGreen', 'pieceRed', 'piecePurple', 'pieceYellow', 'pieceLightBlue']

const pieces = [jPiece, lPiece, sPiece, zPiece, tPiece, oPiece, iPiece]
let bag = [...pieces]

for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]]
}

let currentRot = 0
let currentIndex = 0
let currentPiece = bag[currentIndex][currentRot]
let currentPos = spawnPos[pieceDetector(bag[currentIndex][0])]
let hologramPiece = currentPiece
let hologramPos = currentPos
let level = 0
let lines = 0
let gravity = 750
let newGame = true
let nextIndex = 1
let linesRequired = 4
let cooldownActive = true
let holdPieceIndex
let currentColour
let previewIndex
let cooldownId
let nextColour
let timerId

function reset() {
    // clear everything, but dont restart a new game

    clearInterval(timerId)
    undraw()

    // clear the game board
    for (let i = 0; i < 199; i++) {
        squares.forEach(squares => {
            squares.className = ''
        })
    }

    holdSquares.forEach(holdSquares => {
        holdSquares.className = ''
    })

    previewSquares.forEach(previewSquares => {
        previewSquares.className = ''
    })

    // add the lowest detector line
    for (let i = squares.length - width; i < 20 * width + 10; i++) {
        squares[i].classList.add('taken')
        squares[i].classList.add('detector')
    }

    // randomize the bag
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]]
    }

    currentRot = 0
    currentIndex = 0
    currentPiece = bag[currentIndex][currentRot]
    currentPos = spawnPos[pieceDetector(bag[currentIndex][0])]
    hologramPiece = currentPiece
    hologramPos = currentPos
    level = 0
    lines = 0
    gravity = 750
    nextIndex = 1
    linesRequired = 4
    cooldownActive = false
    holdPieceIndex = null
    currentColour = null
    previewIndex = null
    cooldownId = null
    nextColour = null
    timerId = null

    linesDisplay.innerHTML = '0'
    levelDisplay.innerHTML = '0'
}

startBtn.addEventListener('click', () => {
    //clear everything the first time play is pressed, make a new game for the second time
    if (newGame == true) {
        draw()
        previewShape()
        timerId = setInterval(moveDown, gravity)
        newGame = false
    }

    else {
        reset()
        newGame = true
    }
})

document.addEventListener('keydown', control)

function control(e) {
    switch (e.keyCode) {

        case 37:
            moveLeft()
            break;

        case 39:
            moveRight()
            break;

        case 68:
            if (isRotationValid((currentRot + 1) % 4)) {
                rotateCW()
            }
            break;

        case 65:
            if (isRotationValid((currentRot + 3)%4)) {
                rotateCCW()
            }
            break;

        case 83:
            if (isRotationValid((currentRot + 2) % 4)) {
                rotate180()
            }
            break;

        case 38:
            // move down, if no cooldown
            if (!cooldownActive) {
                undraw()
                currentPos += width
                draw()

                // initiate freeze, if piece hits bottom
                if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
                    cooldownActive = true
                    cooldownId = setTimeout(freeze, 750)
                }
            }
            break;

        case 40:
            hardDrop()
            break;

        case 16:
            hold()
            break;

        case 70:
            // clear game and make new game
            reset()
            draw()  
            previewShape()
            timerId = setInterval(moveDown, gravity)
            break;
    }
}

function draw() {
    // draw hologram
    hologramPiece = currentPiece
    hologramPos = currentPos

    while (!hologramPiece.some(index => squares[hologramPos + index + width].classList.contains('taken'))) {
        hologramPos += width
    }

    hologramPiece.forEach(index => {
        squares[hologramPos + index].classList.add('pieceGray')
    })

    // draw real piece
    currentPiece = bag[currentIndex][currentRot]
    currentColour = colours[pieceDetector(bag[currentIndex][0])]

    currentPiece.forEach(index => {
        squares[currentPos + index].classList.add(currentColour)
    })
}

function undraw() {
    // undraw hologram
    hologramPiece.forEach(index => { squares[hologramPos + index].className = '' })
    
    // undraw real piece
    currentPiece.forEach(index => { squares[currentPos + index].className = '' })
}

function moveLeft() {
    // if not at left edge, move left
    const isAtLeftEdge = currentPiece.some(index => (currentPos + index) % width === 0)
    undraw()

    if (!isAtLeftEdge) {
        currentPos -= 1
    }

    if (currentPiece.some(index => squares[currentPos + index].classList.contains('taken'))) {
        currentPos += 1
    }

    draw()
}

function moveRight() {
    // if not at right edge, move right
    const isAtRightEdge = currentPiece.some(index => (currentPos + index) % width === width -1)
    undraw()

    if (!isAtRightEdge) {
        currentPos += 1
    }

    if (currentPiece.some(index => squares[currentPos + index].classList.contains('taken'))) {
        currentPos -= 1
    }

    draw()
}

function rotateCW() {
    // rotate CW and loop around, if end of array is reached
    undraw()
    currentRot++

    if (currentRot === currentPiece.length) {
        currentRot = 0
    }

    currentPiece = bag[currentIndex][currentRot]
    draw()
}

function rotateCCW() {
    // rotate CCW and loop around, if end of array is reached
    undraw()
    currentRot --

    if (currentRot === -1) {
        currentRot = currentPiece.length - 1
    }

    currentPiece = bag[currentIndex][currentRot]
    draw()
}

function rotate180() {
    // rotate 180 degrees and loop around, if end of array is reached
    undraw()
    currentRot += 2

    if (currentRot >= currentPiece.length) {
        currentRot -= 4
    }

    currentPiece = bag[currentIndex][currentRot]
    draw()
}

function isRotationValid(rotation) {
    let isValid = true
    let rotatedPiece = bag[currentIndex][rotation]

    // check if the rotation hits any pieces
    rotatedPiece.forEach(index => {
        if (squares[currentPos + index].classList.contains('taken')) {
            isValid = false
        }
    })

    // check if the rotation hits the wall through checking the distance in x in all squares
    if (rotatedPiece.some(index => {
        x = (currentPos + index) % width
        return Math.abs(x - (currentPos % width)) >= width / 2
    })) { 
        isValid = false 
    }

    return isValid
}

function hardDrop() {
    // deactivate game loop, move down until piece has been changed by freeze freezing the previous piece
    let pieceBeforeDrop = currentPiece
    clearInterval(timerId)
    undraw()
    
    while (pieceBeforeDrop == currentPiece) {
        undraw()
        currentPos += width
        draw()

        if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
            freeze()
        }
    }
 
    timerId = setInterval(moveDown, gravity)
}

function hold() {
    undraw()

    // if it's first piece to be held, set current pice aside and get a new one
    if (holdPieceIndex == null) {
        holdPieceIndex = currentIndex
        currentIndex = nextIndex
        currentPiece = bag[currentIndex][currentRot]
        nextIndex ++

        // renew bag, if used up
        if (nextIndex === bag.length) {
            nextIndex = 0

            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
        }
    }

    // else swap held piece and current piece
    else {
        let temp
        temp = holdPieceIndex
        holdPieceIndex = currentIndex
        currentIndex = temp
    }

    // update game boards
    holdSquares.forEach(holdSquares => {
        holdSquares.className = ''
    })

    previewPieces[pieceDetector(bag[holdPieceIndex][0])].forEach(index => {
        holdSquares[index].classList.add(colours[pieceDetector(bag[holdPieceIndex][0])])
    })

    currentPiece = bag[currentIndex][currentRot]
    previewShape()
    draw()
}

function freeze() {
    // create collision 
    currentPiece.forEach(index => squares[currentPos + index].classList.add('taken'))
    // cycle in next piece
    currentIndex = nextIndex
    nextIndex ++

    // renew bag, if used up
    if (nextIndex === bag.length) {
        nextIndex = 0

        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
    }

    // update game state and board
    currentPos = spawnPos[pieceDetector(bag[currentIndex][0])]
    currentRot = 0
    cooldownActive = false
    currentPiece = bag[currentIndex][currentRot]
    
    addScore()
    leveling()
    draw()
    previewShape()
    gameOver()
}

function leveling() {
    // if enough lines, level up, increase level requirement and inrease speed
    if (lines >= linesRequired) {
        level ++
        lines = lines - linesRequired
        linesRequired = level * 2 + 4
        gravity *= 0.75
        levelDisplay.innerHTML = level
        clearInterval(timerId)
        timerId = setInterval(moveDown, gravity)
    }

    linesDisplay.innerHTML = `${lines} / ${linesRequired}`
}

function addScore() {
    // check, if any entire row has collision
    for (let i = 0; i < 199; i += width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

        if(row.every(index => squares[index].classList.contains('taken'))) {
            // update game state
            lines += 1
            linesDisplay.innerHTML = `${lines}/${linesRequired}`

            row.forEach(index => {
                squares[index].className = ''
                squares[index].style.backgroundColor = ''
            })

            // remove full line and move down entire board
            const squaresRemoved = squares.splice(i, width)
            squares = squaresRemoved.concat(squares)
            squares.forEach(cell => grid.appendChild(cell))
        }
    }
}

function previewShape() {
    // detect next piece and draw
    let previewIndex = pieceDetector(bag[nextIndex][0])
    let nextColour = colours[previewIndex]

    previewSquares.forEach(previewSquares => {
        previewSquares.className = ''
    })

    previewPieces[previewIndex].forEach(index => {
        previewSquares[index].classList.add(nextColour)
    })
}

function gameOver() {
    // if no piece placeable, reset
    if(currentPiece.some(index => squares[currentPos + index].classList.contains('taken'))) {
        reset()
    }

    newGame = true
}

function moveDown() {
    //game loop, move down with the interval
    if (!cooldownActive) {
        undraw()
        currentPos += width
        draw()

        if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
            cooldownActive = true
            cooldownId = setTimeout(freeze, 750)
        }
    }
}

function pieceDetector(piece) {
    // translate pieces
    piece = JSON.stringify(piece)

    if (piece == JSON.stringify(pieces[0][0])) {
        return 0
    }

    else if (piece  == JSON.stringify(pieces[1][0])) {
        return 1
    }

    else if (piece  == JSON.stringify(pieces[2][0])) {
        return 2
    }

    else if (piece  == JSON.stringify(pieces[3][0])) {
        return 3
    }

    else if (piece  == JSON.stringify(pieces[4][0])) {
        return 4
    }

    else if (piece == JSON.stringify(pieces[5][0])) {
        return 5
    }

    else if (piece == JSON.stringify(pieces[6][0])) {
        return 6
    }
}
