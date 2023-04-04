/*
    To-Do:

Important:
- yaay

Other:
- hologram
- cooldown before freeze
*/

const grid = document.querySelector('.grid')
const previewSquares = document.querySelectorAll('div.preview-grid div')
const holdSquares = document.querySelectorAll('div.hold-grid div')
const linesDisplay = document.querySelector('#lines')
const levelDisplay = document.querySelector('#level')
const startBtn = document.querySelector('#play-button')
let squares = Array.from(document.querySelectorAll('.grid div'))

const width = 10
const previewWidth = 4

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

const colours = [
    'pieceBlue',
    'pieceOrange',
    'pieceGreen',
    'pieceRed',
    'piecePurple',
    'pieceYellow',
    'pieceLightBlue'
]

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
let level = 0
let lines = 0
let gravity = 75000000
let nextIndex = 1
let linesRequired = 4
let holdPieceIndex
let previewIndex
let nextColour
let timerId

previewSquares.forEach(previewSquares => {
    previewSquares.className = ''
})

function reset() {
    clearInterval(timerId)
    undraw()

    for (let i = 0; i < 199; i ++) {
        squares.forEach(squares => {
            squares.className = ''
        })
    }

    for (let i = squares.length - width; i < 20 * width + 10; i++) {
        squares[i].classList.add('taken')
        squares[i].classList.add('detector')
    }

    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]]
    }

    currentRot = 0
    currentIndex = 0
    currentPiece = bag[currentIndex][currentRot]
    currentPos = spawnPos[pieceDetector(bag[currentIndex][0])]
    level = 0
    lines = 0
    gravity = 750
    nextIndex = 1
    linesRequired = 4
    holdPieceIndex = null
    previewIndex = null
    nextColour = null
    timerId = null

    holdSquares.forEach(holdSquares => {
        holdSquares.className = ''
    })

    previewSquares.forEach(previewSquares => {
        previewSquares.className = ''
    })

    linesDisplay.innerHTML = '0'
    levelDisplay.innerHTML = '0'
}

startBtn.addEventListener('click', () => {
    reset()
    draw()
    previewShape()
    timerId = setInterval(moveDown, gravity)
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

        case 67:
            if (isRotationValid((currentRot + 1) % 4)) 
                rotateCW()
            break;

        case 89:
            if (isRotationValid((currentRot + 3)%4))
                rotateCCW()
            break;

        case 88:
            if (isRotationValid((currentRot + 2) % 4))
                rotate180()
            break;

        case 38:
            moveDown()
            break;

        case 40:
            hardDrop()
            break;

        case 16:
            hold()
            break;

        case 86:
            reset()
            draw()
            previewShape()
            timerId = setInterval(moveDown, gravity)
            break;

    }
}

function draw() {

    currentPiece = bag[currentIndex][currentRot]

    let currentColour = colours[pieceDetector(bag[currentIndex][0])]

    currentPiece.forEach(index => {
        squares[currentPos + index].classList.add(currentColour)
    })
}

function undraw() {
    currentPiece.forEach(index => {
        squares[currentPos + index].className = ''
    })
}

function moveLeft() {
    undraw()
    const isAtLeftEdge = currentPiece.some(index => (currentPos + index) % width === 0)

    if (!isAtLeftEdge) {
        currentPos -= 1
    }

    if (currentPiece.some(index => squares[currentPos + index].classList.contains('taken'))) {
        currentPos += 1
    }

    draw()
}

function moveRight() {
    undraw()
    const isAtRightEdge = currentPiece.some(index => (currentPos + index) % width === width -1)

    if (!isAtRightEdge) {
        currentPos += 1
    }

    if (currentPiece.some(index => squares[currentPos + index].classList.contains('taken'))) {
        currentPos -= 1
    }

    draw()
}

function rotateCW() {
    undraw()
    currentRot++

    if (currentRot === currentPiece.length) {
        currentRot = 0
    }

    currentPiece = bag[currentIndex][currentRot]
    draw()
}

function rotateCCW() {
    undraw()
    currentRot --

    if (currentRot === -1) {
        currentRot = currentPiece.length - 1
    }

    currentPiece = bag[currentIndex][currentRot]
    draw()
}

function rotate180() {
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

    rotatedPiece.forEach(index => {
        if (squares[currentPos + index].classList.contains('taken')) {
            isValid = false
        }
    })
    

    if (rotatedPiece.some(index => {
        x = (currentPos + index) % width
        return Math.abs(x - (currentPos%width)) >=width/2
    })) {
        isValid = false
    }

    return isValid
}

function hardDrop() {
    clearInterval(timerId)
    
    let pieceBeforeDrop = currentPiece

    while (pieceBeforeDrop == currentPiece) {
        moveDown()
    }

    timerId = setInterval(moveDown,gravity)
}

function hold() {

    undraw()

    if (holdPieceIndex == null) {
        holdPieceIndex = currentIndex
        currentIndex = nextIndex
        currentPiece = bag[currentIndex][currentRot]
        nextIndex ++

        if (nextIndex === bag.length) {
            nextIndex = 0

            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
        }
    }

    else {
        let temp
        temp = holdPieceIndex
        holdPieceIndex = currentIndex
        currentIndex = temp
    }

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
    if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
        currentPiece.forEach(index => squares[currentPos + index].classList.add('taken'))

        currentIndex = nextIndex
        currentPiece = bag[currentIndex][currentRot]
        nextIndex ++

        if (nextIndex === bag.length) {
            nextIndex = 0

            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
        }

        currentPos = spawnPos[pieceDetector(bag[currentIndex][0])]
        currentRot = 0

        addScore()
        leveling()
        draw()
        previewShape()
        gameOver()
    }
}

function leveling() {
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
    for (let i = 0; i < 199; i += width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

        if(row.every(index => squares[index].classList.contains('taken'))) {
            lines += 1
            linesDisplay.innerHTML = `${lines}/${linesRequired}`
            row.forEach(index => {
                squares[index].className = ''
                squares[index].style.backgroundColor = ''
            })
            const squaresRemoved = squares.splice(i, width)
            squares = squaresRemoved.concat(squares)
            squares.forEach(cell => grid.appendChild(cell))
        }
    }
}

function previewShape() {

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
    if(currentPiece.some(index => squares[currentPos + index].classList.contains('taken'))) {
        reset()
    }
}

function moveDown() {
    undraw()
    currentPos += width
    draw()
    freeze()
}

function pieceDetector(piece) {
    piece = JSON.stringify(piece)

    if (piece == JSON.stringify(pieces[0][0])) {
        return 0;
    }

    else if (piece  == JSON.stringify(pieces[1][0])) {
        return 1;
    }

    else if (piece  == JSON.stringify(pieces[2][0])) {
        return 2;
    }

    else if (piece  == JSON.stringify(pieces[3][0])) {
        return 3;
    }

    else if (piece  == JSON.stringify(pieces[4][0])) {
        return 4;
    }

    else if (piece == JSON.stringify(pieces[5][0])) {
        return 5;
    }

    else if (piece == JSON.stringify(pieces[6][0])) {
        return 6;
    }
}
