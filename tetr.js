/*                                                                 TO-DO
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    -   make size width and height dependant
    -   finesse
    -   music

.                                                                  BUGS
    -   P/S shows infinite
    -   P/S shows N/A
    -   i-piece can gltich form left to right by flipping
    -   s/z spin doesen't register
    -   spins register worngly
    -   cant flip i-piece in proximity of wall
    -   gravity doesn't get turned off when restarting
    -   settings inputs cut off long numbers
    -   game breaks when strings in settings
*/

/*                                                               STRUCTURE
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    setup
        setup
        event listener play
        event listener settings
        reset()

    game loop
        moveDown()
        draw()
        undraw()
        freeze()

    player inputs
        controls()
        rebind()
        moveLeft()
        moveRight()
        rotateCW()
        rotateCWW()
        flip()
        hardDrop()
        hold()

    other procedures
        previewShape()
        lineClear()
        showAlert()

    functions
        spawnPos()
        kick()
        isRotationValid()
        pieceTranslator()

.                                                                SETUP
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

// settings
let width = 10
let previewWidth = 4
let ARR = document.querySelector('#ARRInput').value
let DAS = document.querySelector('#DASInput').value
let SDF = document.querySelector('#SDFInput').value
let gravity = document.querySelector('#gravityInput').value
let cooldownTime = document.querySelector('#cooldownInput').value
let musicVol = document.querySelector('#musicInput').value

// initiate all variables
let alertString
let ARRInterval
let basePoints = 1000
let cheatActivated
let cooldownActive = false
let cooldownId
let currentColour
let DASTimeout
let gravityId
let gravityMultiplyer = 0.99
let holdLock = false
let holdPiece
let inputCounter = 0
let inputsPerPiece = []
let level = 1
let lines = 0
let linesRequired = 4
let minutes = 0
let minutesId
let newGame = true
let piecesCounter = 0
let points = 0
let previewColour = []
let previewIndex = []
let previewOffset
let repeatActive = 0
let seconds = 0
let secondsId
let settingsActive
let settingsId
let wasSpin
let xOffset
let yOffset

// set standard controls
let controls = {
    'moveLeft' : 'ArrowLeft',
    'moveRight' : 'ArrowRight',
    'rotateCW' : 'd',
    'rotateCCW' : 'a',
    'flip' : 's',
    'softDrop' : 'ArrowUp',
    'hardDrop' : 'ArrowDown',
    'hold' :   'Shift',
    'reset' : 'f',
}

// get html elements
let squares = Array.from(document.querySelectorAll('.grid div'))
const finesseDisplay = document.querySelector('#finesse')
const grid = document.querySelector('.grid')
const holdSquares = document.querySelectorAll('div.hold-grid div')
const inputsPerPieceDisplay = document.querySelector('#inputsPerPiece')
const pointsDisplay = document.querySelector('#points')
const piecesPerSecondDisplay = document.querySelector('#piecesPerSecond')
const previewSquares = document.querySelectorAll('div.preview-grid div')
const timerMinutesDisplay = document.querySelector('#timerMinutes')
const timerSecondsDisplay = document.querySelector('#timerSeconds')

// define the pieces
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
    [previewWidth, previewWidth + 1, previewWidth + 2, previewWidth + 3],
]

const colours = [
    'pieceBlue', 
    'pieceOrange', 
    'pieceGreen', 
    'pieceRed', 
    'piecePurple', 
    'pieceYellow', 
    'pieceLightBlue'
]

let kickTable = [
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],

    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],

    [[0, 0], [1, 0], [1, -1], [0, -2], [1, 2]],
    [[0, 0], [-1, 0], [-1, 1], [0, 2], [-1, -2]],

    [[0, 0], [-1, 0], [-1, 1], [0, 2], [-1, -2]],
    [[0, 0], [1, 0], [1, -1], [0, -2], [1, 2]]
]

let kickTableIPiece = [
    [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],

    [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
    [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],

    [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],

    [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
]

let rotationTranslation = {
    '0,1': 0,
    '1,0': 1,
    '1,2': 2,
    '2,1': 3,
    '2,3': 4,
    '3,2': 5,
    '3,0': 6,
    '0,3': 7,
    '0,2': 8
}

let piecesStrings = [ 'j', 'l', 'z', 's', 't', 'o', 'i' ]

// make a 3d Matix and shuffle it
const pieces = [jPiece, lPiece, sPiece, zPiece, tPiece, oPiece, iPiece]
let bag = [...pieces]

for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]]
}

let currentRot = 0
let currentPiece = bag[0][0]
let currentPos = spawnPos(currentPiece)
let hologramPiece = currentPiece
let hologramPos = currentPos

// initiate eventlisteners for all controls
for (let i = 0; i < Object.keys(controls).length; i++) {
    document.querySelector('#' + Object.keys(controls)[i]).addEventListener('click', () => { 
        settingsId = Object.keys(controls)[i]
        document.addEventListener('keydown', rebind)
    })
}

document.querySelector('#play-button').addEventListener('click', () => {
    //clear everything the first time play is pressed, make a new game for the second time
    if (newGame == true) {
        alertString = null
        newGame = false
        showAlert()
        previewShape()
        draw()
        clearInterval(gravityId)
        gravityId = setInterval(moveDown, gravity)

        // set up intervals for the timer
        minutesId = setInterval(() => {
            minutes ++

            if (minutes == 60) {
                minutes = 0
            }

            if (minutes < 10) {
                timerMinutesDisplay.innerHTML = `0${minutes}`
            }

            else {
                timerMinutesDisplay.innerHTML = `${minutes}`
            }
        }, 60000);

        secondsId = setInterval(() => {
            seconds ++

            if (seconds == 60) {
                seconds = 0
            }

            if (seconds < 10) {
                timerSecondsDisplay.innerHTML = `0${seconds}`
            }

            else {
                timerSecondsDisplay.innerHTML = `${seconds}`
            }
        }, 1000);

        // set up event listeners for controls
        document.addEventListener('keydown', control)
        document.addEventListener('keyup', () => {
                // as soon as player lifts key, stop movement. this may be during single move or fast movement
                clearTimeout(DASTimeout)
                clearInterval(ARRInterval)
                repeatActive = false
            }
        )
    }
    
    else {
        reset()
        newGame = true
        document.removeEventListener('keydown', control)
    }
})

document.querySelector('#settings-button').addEventListener('click', () => {
    // make the settings visible
    document.getElementById("settings").style["display"] = "inline"

    // if player presses esc, update all settings
    document.addEventListener('keydown', e => {
        if (e.key == 'Escape') {
            if(!cheatActivated) {
                ARR = document.querySelector('#ARRInput').value
                DAS = document.querySelector('#DASInput').value
                SDF = document.querySelector('#SDFInput').value
            }
            musicVol = document.querySelector('#musicInput').value
            gravity = document.querySelector('#gravityInput').value
            cooldownTime = document.querySelector('#cooldownInput').value

            document.getElementById("settings").style["display"] = "none"
            newGame = true
            settingsActive = false
            reset()
        }
    })

    settingsActive = true
})

function reset() {
    // clear the game boards
    squares.forEach(squares => {
        squares.className = ''
    })

    holdSquares.forEach(holdSquares => {
        holdSquares.className = ''
    })

    previewSquares.forEach(previewSquares => {
        previewSquares.className = ''
    })

    // add the lowest detector line
    for (let i = squares.length - width; i < 22 * width + 10; i++) {
        squares[i].classList.add('taken')
        squares[i].classList.add('detector')
    }

    // add the two highest top lines
    for (let i = 0; i < 2 * width; i++) {
        squares[i].classList.add('topSquare')
    }

    bag = [...pieces]

    // randomize the bag
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]]
    }

    // reset everything
    cooldownActive = false
    currentRot = 0
    currentPiece = bag[0][0]
    currentPos = spawnPos(currentPiece)
    holdLock = false
    hologramPiece = currentPiece
    hologramPos = currentPos
    holdPiece = null
    inputCounter = 0
    inputsPerPiece = []
    level = 1
    lines = 0
    linesRequired = 4
    minutes = 0
    piecesCounter = 0
    points = 0
    seconds = 0
    settingsActive = false
    
    finesseDisplay.innerHTML = '100'
    inputsPerPieceDisplay.innerHTML = '0.0'
    pointsDisplay.innerHTML = '0'
    piecesPerSecondDisplay.innerHTML = '0.0'
    timerMinutesDisplay.innerHTML = '00'
    timerSecondsDisplay.innerHTML = '00'

    clearInterval(gravityId)
    clearInterval(minutesId)
    clearInterval(secondsId)
    clearInterval(ARRInterval)
    clearTimeout(DASTimeout)
    clearTimeout(cooldownId)
}

//                                                             GAME LOOP
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function moveDown() {
    // if there is no cooldown, test if piece has hit bottom and initiate game loop
    if (!cooldownActive) {
        if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
            cooldownActive = true
            cooldownId = setTimeout(freeze, cooldownTime)
        }

        else {
            undraw()
            currentPos += width
            draw()

            let piecesPerSecond = piecesCounter/(seconds+minutes*60)
            piecesPerSecondDisplay.innerHTML = piecesPerSecond.toFixed(1)
        }
    }

    // if there is, check again and if it isn't true, resume game loop
    else {
        if (!currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
            cooldownActive = false
            clearTimeout(cooldownId)
            lineClear()
            leveling()
            draw()
            previewShape()
            clearInterval(gravityId)
            gravityId = setInterval(moveDown, gravity)
        }
    }
}

function draw() {
    // draw hologram and real piece
    currentPiece = bag[0][currentRot]
    currentColour = colours[pieceTranslator(bag[0][0])]

    hologramPiece = currentPiece
    hologramPos = currentPos

    while (!hologramPiece.some(index => squares[hologramPos + index + width].classList.contains('taken'))) {
        hologramPos += width
    }

    hologramPiece.forEach(index => {
        squares[hologramPos + index].classList.add('pieceGray')
    })

    currentPiece.forEach(index => {
        squares[currentPos + index].classList.add(currentColour)
    })
}

function undraw() {
    // undraw hologram and real piece
    hologramPiece.forEach(index => { squares[hologramPos + index].className = '' })
    currentPiece.forEach(index => { squares[currentPos + index].className = '' })

    // reset the top squares, if they got cleared (with margin for safety)
    if (currentPos < 40) {
        for (let i = 0; i < 2 * width; i++) {
            squares[i].classList.add('topSquare')
        }
    }
}

function freeze() {
    if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {

        // undraw hologram and redraw overwritten squares of the real piece
        hologramPiece.forEach(index => { squares[hologramPos + index].className = '' })
        currentPiece.forEach(index => {
            squares[currentPos + index].classList.add(currentColour)
        })

        // create collision 
        currentPiece.forEach(index => squares[currentPos + index].classList.add('taken'))

        // check if game is over
        for (let i = 0; i < 4; i++) {
            if (currentPos + i < 20) {
                document.removeEventListener('keydown', control)
                newGame = true
                alertString = 'game over'
                clearInterval(gravityId)
                reset()
                showAlert()

                return 'game_over'
            }
        }

        // cycle in next piece
        bag.splice(0, 1)

        // if bag gets too small, add in a new bag
        if (bag.length == 5) {
            let temp = [...pieces]

            for (let i = temp.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [temp[i], temp[j]] = [temp[j], temp[i]];
            }

            bag.push.apply(bag, temp)
        }

        // update game state
        currentRot = 0
        currentPiece = bag[0][0]
        currentPos = spawnPos(currentPiece)
        holdLock = false

        if (holdPiece != null) {
            // recolour the held piece
            holdSquares.forEach(holdSquares => {
                holdSquares.className = ''
            })
            
            previewPieces[pieceTranslator(holdPiece)].forEach(index => {
                holdSquares[index].classList.add(colours[pieceTranslator(holdPiece)])
            })
        }

        if (inputsPerPiece.length > 10) {
            inputsPerPiece.splice(0, 1)
        }
        inputsPerPiece.splice(inputsPerPiece.length - 1, 0, inputCounter)
        inputsPerPieceAverage = inputsPerPiece.reduce((a, b) => a + b, 0) / inputsPerPiece.length
        inputsPerPieceDisplay.innerHTML = inputsPerPieceAverage.toFixed(1);
        inputCounter = 0
    }

    // update the board
    piecesCounter ++
    cooldownActive = false
    lineClear()
    draw()
    previewShape()
    lineClear()
    return 'frozen'
}

//                                                           PLAYER INPUTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function control(e) {
    switch (e.key) {
        case controls['moveLeft']:
            // move left for the first time and make a timeout for the repeating movement
            if (repeatActive == false) {
                moveLeft()

                DASTimeout = setTimeout(() => {
                    ARRInterval = setInterval(moveLeft, ARR)
                }, DAS);

                repeatActive = true
                inputCounter ++
            }

            break;
            
        case controls['moveRight']:
            // move right for the first time and make a timeout for the repeating movement
            if (repeatActive == false) {
                moveRight()

                DASTimeout = setTimeout(() => {
                    ARRInterval = setInterval(moveRight, ARR)
                }, DAS);

                repeatActive = true
                inputCounter ++
            }

            break;

        case controls['rotateCW']:
            if (kick((currentRot + 1) % 4)) {
                rotateCW()
            }
            
            inputCounter ++
            break;

        case controls['rotateCCW']:
            if (kick((currentRot + 3)%4)) {
                rotateCCW()
            }
            
            inputCounter ++
            break;

        case controls['flip']:
            if (flipValid((currentRot + 2) % 4)) {
                flip()
            }
            
            inputCounter ++
            break;

        case controls['softDrop']:
            // move down, if no cooldown
            if (repeatActive == 0) {
                ARRInterval = setInterval(() => {
                    if (!cooldownActive) {
                        undraw()
                        currentPos += width
                        draw()
        
                        // initiate freeze, if piece hits bottom
                        if (currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
                            cooldownActive = true
                            cooldownId = setTimeout(freeze, cooldownTime)
                        }
                    }
                }, SDF)
            }

            repeatActive ++
            break;

        case controls['hardDrop']:
            hardDrop()
            break;

        case controls['hold']:
            // make it so player can only hold once
            if (!holdLock) {
                hold()

                // colour the held piece gray
                holdSquares.forEach(holdSquares => {
                    holdSquares.className = ''
                })

                previewPieces[pieceTranslator(holdPiece)].forEach(index => {
                    holdSquares[index].classList.add('pieceGray')
                })
            }
            
            holdLock = true
            break;

        case controls['reset']:
            // clear game and make new game
            reset()
            draw()  
            previewShape()
            clearInterval(gravityId)
            gravityId = setInterval(moveDown, gravity)
            break;

        case 'ä':
            // set perfect controls
            controls = {
                'moveLeft' : ',',
                'moveRight' : '-',
                'rotateCW' : 'x',
                'rotateCCW' : '<',
                'flip' : 'y',
                'softDrop' : 'l',
                'hardDrop' : '.',
                'hold' :   'Shift',
                'reset' : 'c',
            }

            ARR = 0
            DAS = 120
            SDF = 0
        break;
    }
}

// if one of the keys gets clicked, assign the function to the next pressed key
function rebind(e) {
    controls[settingsId] = e.key
    
    if (e.key == 'ArrowRight') {
        document.querySelector('#' + settingsId).innerHTML = '→';
    }

    else if (e.key == 'ArrowLeft') {
        document.querySelector('#' + settingsId).innerHTML = '←';
    }

    else if (e.key == 'ArrowUp') {
        document.querySelector('#' + settingsId).innerHTML = '↑';
    }

    else if (e.key == 'ArrowDown') {
        document.querySelector('#' + settingsId).innerHTML = '↓';
    }

    else {
        document.querySelector('#' + settingsId).innerHTML = e.key;
    }

    document.removeEventListener('keydown', rebind)
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

    currentRot = (currentRot + 1) % 4
    currentPiece = bag[0][currentRot]
    currentPos = currentPos + xOffset + yOffset

    draw()
}

function rotateCCW() {
    // rotate CCW and loop around, if end of array is reached
    undraw()

    currentRot = (currentRot + 3) % 4
    currentPiece = bag[0][currentRot]
    currentPos = currentPos + xOffset + yOffset

    draw()
}

function flip() {
    // rotate 180 degrees and loop around, if end of array is reached
    undraw()

    currentRot = (currentRot + 2) % 4
    currentPiece = bag[0][currentRot]

    draw()
}

function hardDrop() {
    // move down until something is hit
    undraw()

    while (!currentPiece.some(index => squares[currentPos + index + width].classList.contains('taken'))) {
        currentPos += width
    }

    if (freeze() == 'game_over') {
        return
    }
}

function hold() {
    undraw()

    // if it's first piece to be held, set current pice aside and get a new one
    if (holdPiece == null) {
        holdPiece = bag[0][0]
        bag.splice(0, 1)
        
        // if bag gets too small, add in a new bag
        if (bag.length == 5) {
            let temp = [...pieces]

            for (let i = temp.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [temp[i], temp[j]] = [temp[j], temp[i]];
            }

            bag.push.apply(bag, temp)
        }
    }

    // else swap held piece and current piece
    else {
        let temp = holdPiece
        holdPiece = bag[0][0]
        bag.splice(0, 1, pieces[pieceTranslator(temp)])
    }

    // update game boards
    holdSquares.forEach(holdSquares => {
        holdSquares.className = ''
    })

    previewPieces[pieceTranslator(holdPiece)].forEach(index => {
        holdSquares[index].classList.add(colours[pieceTranslator(holdPiece)])
    })

    currentPiece = bag[0][currentRot]
    draw()
}

//                                                         OTHER PROCEDURES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function previewShape() {
    let IPieceOffset = 0

    // clear board
    previewSquares.forEach(previewSquares => {  
        previewSquares.className = ''
    })

    // display the next 5 pieces under each other, deduct one space if it's an i-piece
    for (let i = 0; i < 5; i++) {        
        previewIndex = pieceTranslator(bag[i + 1][0])
        previewColour = colours[previewIndex]

        if (previewIndex == 6) {
            IPieceOffset = 1
        }

        previewOffset = (i - (1 / 3 * IPieceOffset)) * 12

        previewPieces[previewIndex].forEach(index => {
            previewSquares[index + previewOffset].classList.add(previewColour)
        })
    }
}

function lineClear() {
    // check, if any entire row has collision
    for (let i = 2 * width; i < width * 22 - 1; i += width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

        if(row.every(index => squares[index].classList.contains('taken'))) {
            // update game state
            lines ++

            row.forEach(index => {
                squares[index].className = ''
                squares[index].style.backgroundColor = ''
            })

            // remove full line and move down entire board
            const squaresRemoved = squares.splice(i, width)
            squares = squaresRemoved.concat(squares)
            squares.forEach(cell => grid.appendChild(cell))

            // remove any classes that got moved down by accident
            for (let i = 20; i < 40; i++) {
                squares[i].className = ''
            }

            
        }
    }
    if (lines > 0) {
        if (!wasSpin) {
            switch (lines) {
                case 1:
                    alertString = 'single'
                    break;

                case 2:
                    alertString = 'double'
                    break;

                case 3:
                    alertString = 'triple'
                    break;

                case 4:
                    alertString = 'quad'
                    break;
            }

            showAlert()
            points += basePoints * lines
        }

        else {
            points += basePoints * 4
        }

        gravity *= Math.pow(gravityMultiplyer, lines)
        wasSpin = false
        lines = 0
        clearInterval(gravityId)
        gravityId = setInterval(moveDown, gravity)
        pointsDisplay.innerHTML = points
    }
}

function showAlert() {
    try {
        grid.classList.add(alertString)
        setTimeout(() => {
            grid.className = ''
            grid.classList.add('grid')
            alert = null
        }, 2000);
    }

    catch {}
}

//                                                             FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function spawnPos() {
    if (pieceTranslator(bag[0][0] == 5)) {
        return 4
    }

    return 3
}

function flipValid(rotation) {
    if (
        bag[0][rotation].some(index => {
            return squares[currentPos + index].classList.contains('taken')
        }) ||
        bag[0][rotation].some(index => {
            x = (currentPos + index) % width
            return Math.abs(x - ((currentPos) % width)) >= width / 2
        })
    ) {
        return false
    }

    return true
}

function kick(rotation) {
    // dont rotate if the pice is an o-piece
    if (pieceTranslator(bag[0][0] == 5)) {
        xOffset = 0
        yOffset = 0
        return true
    }    

    // save the future piece and the direction of rotation
    let rotatedPiece = bag[0][rotation]
    let rotationType =  rotationTranslation[`${currentRot},${rotation}`]

    // try the 5 different allowed positions 
    for (let i = 0; i < 5; i++) {
        let validSquares = 0

        // use a different kick table for i-pieces
        if (pieceTranslator(bag[0][0]) == 6) {
            xOffset = kickTableIPiece[rotationType][i][0]
            yOffset = kickTableIPiece[rotationType][i][1] * width
        }
        
        // get the different offsets
        else {
            xOffset = kickTable[rotationType][i][0]
            yOffset = kickTable[rotationType][i][1] * width
        }

        // if count the valid squares
        rotatedPiece.forEach(index => {
            let offsetIndex  = currentPos + index + xOffset + yOffset

            try {
                if (!squares[offsetIndex].classList.contains('taken')) {
                    validSquares ++
                }
            }

            catch {}
        })

        //  if all positions are valid and if the rotation doesnt hit the wall through checking the difference in x, allow the rotation
        if (validSquares == 4  && 
            !rotatedPiece.some(index => {
                x = (currentPos + index + xOffset) % width
                return Math.abs(x - ((currentPos + xOffset) % width)) >= width / 2
            })
        ) {
            if (i != 0 || pieceTranslator(bag[0][0]) == 4) {
                for (let i = 0; i < 4; i++) {
                    try {
                        if (squares[currentPos + rotatedPiece[i] - width].classList.contains('taken')) {
                            alertString = piecesStrings[pieceTranslator(bag[0][0])] + '-spin'
                            wasSpin = true
                            points += basePoints
                            showAlert()
                        }
                    }

                    catch {}
                }
            }

            return true
        }
    }

    return false
}

function pieceTranslator(piece) {
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
