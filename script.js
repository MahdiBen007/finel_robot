// function generate maze
var mazeSize;
var path = [];
function generateMaze() {
    mazeSize = document.getElementById("maze-size").value;
    var maze = document.getElementById("maze");
    if (mazeSize <= 0) {
        alert("Please enter a valid maze size.");
        return;
    }
    maze.innerHTML = "";
    for (var i = 0; i < mazeSize; i++) {
        var row = document.createElement("div");
        row.classList.add("maze-row");
        for (var j = 0; j < mazeSize; j++) {
            var cell = document.createElement("div");
            cell.classList.add("maze-cell");
            if (i === 0 && j === 0) {
                cell.classList.add("start");
            } else if (i === mazeSize - 1 && j === mazeSize - 1) {
                cell.classList.add("end");
            }
            cell.id = i + "-" + j;
            row.appendChild(cell);
        }
        maze.appendChild(row);
    }
}

//function randomizeTerrain
function randomizeTerrain() {
var mazeCells = document.querySelectorAll('.maze-cell');
var emptyRatio = 0.7; 
mazeCells.forEach(function(cell) 
{
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
        if (Math.random() < emptyRatio) {
            return;
        }
        var randomTerrain = Math.floor(Math.random() * 4); 

        switch (randomTerrain) {
            case 0:
                cell.classList.remove("water", "sand", "grass");
                cell.classList.add("wall");
                break;
            case 1:
                cell.classList.remove("sand", "grass", "wall");
                cell.classList.add("water");
                break;
            case 2:
                cell.classList.remove("water", "sand", "wall");
                cell.classList.add("grass");
                break;
            case 3:
                cell.classList.remove("water", "grass", "wall");
                cell.classList.add("sand");
                break;
            default:
                alert("Invalid terrain!");
        }
    }
});
}

//function la method de A*
function findShortestPath() {
    if (!mazeSize) {
        alert("Please generate the maze first.");
        return;
    }
    var startCell = document.querySelector('.maze-cell.start');
    var endCell = document.querySelector('.maze-cell.end');
    var openSet = [startCell];
    var viseted = [];
    var optimal_path = {};

    var gScore = {};
    var fScore = {};
    for (var i = 0; i < mazeSize; i++) {
        for (var j = 0; j < mazeSize; j++) {
            var cell = document.querySelector('.maze-row:nth-child(' + (i + 1) + ') .maze-cell:nth-child(' + (j + 1) + ')');
            gScore[cell.id] = Infinity;
            fScore[cell.id] = Infinity;
        }
    }
    gScore[startCell.id] = 0;
    fScore[startCell.id] = heuristic(startCell, endCell);

    while (openSet.length > 0) {
    var current = getLowestFScore(openSet, fScore);
    if (current === endCell) {
        reconstructPath(optimal_path, current);
        return;
    } 
        
    openSet = openSet.filter(cell => cell !== current);
    viseted.push(current);

    var neighbors = getNeighbors(current);
    for (var neighbor of neighbors) {

        if (viseted.includes(neighbor)) {
            continue;
        }

        if (current.classList.contains('water') && neighbor.classList.contains('water')) {
            continue; 
        }
        
        var tentativeGScore = gScore[current.id] + 1;
        if (!openSet.includes(neighbor)) 
        {
            openSet.push(neighbor);
        } else if (tentativeGScore >= gScore[neighbor.id]) {
            continue;
        }

        optimal_path[neighbor.id] = current;
        gScore[neighbor.id] = tentativeGScore;
        fScore[neighbor.id] = gScore[neighbor.id] + heuristic(neighbor, endCell);
    }
}
alert("No path found!");

//for (var i = viseted.length - 1; i >= 0; i--) {
//    var cell = viseted[i];
    // Assuming goBackward() is a function that instructs the robot to move backward
//    goBackward();
//}
}

function getPosition(cell) {
    var index = cell.id.split("-");
    return [parseInt(index[0]), parseInt(index[1])];
}

function heuristic(a, b) {
    var aPosition = getPosition(a);
    var bPosition = getPosition(b);
    return Math.abs(aPosition[0] - bPosition[0]) + Math.abs(aPosition[1] - bPosition[1]);
}

function getNeighbors(cell) {
    var position = getPosition(cell);
    var neighbors = []; 
    var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    for (var dir of directions) {
        var neighborX = position[0] + dir[0];
        var neighborY = position[1] + dir[1];
        var neighborId = neighborX + "-" + neighborY;
        var neighborCell = document.getElementById(neighborId);
        
        if (neighborCell && !neighborCell.classList.contains('wall')) {
            neighbors.push(neighborCell);
        }
    }
    return neighbors;
}

function getLowestFScore(set, fScore) {
    var lowest = set[0];
    for (var cell of set) {
        if (fScore[cell.id] < fScore[lowest.id]) {
            lowest = cell;
        }
    }
    return lowest;
} 

function reconstructPath(optimal_path, current) {
    var tempPath = [];
    while (optimal_path[current.id]) {
        tempPath.push(current);
        current = optimal_path[current.id];
    }
    tempPath.push(current);
    tempPath.reverse();
    path = tempPath;

    for (var cell of path) {
        if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
            cell.style.backgroundColor = '#ffa500';
        }
    }
}


//Fonction de deplacement du robot

var batteryLevel = 100;
var robotMoved = false;
function moveRobot() {
if (path.length === 0) {
    alert("Please find the shortest path first.");
    return;
}

var nextCell = path[0];
if (nextCell) {
    var robotCell = document.querySelector('.maze-cell.start');
    robotCell.classList.remove('start');
    nextCell.classList.add('start');

    nextCell.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var delay = 300;
    if (nextCell.classList.contains('water')) {
        delay = 600;
        batteryLevel -= 7; 
    } else if (nextCell.classList.contains('sand')) {
        delay = 900;
        batteryLevel -= 10; 
    } else if (nextCell.classList.contains('grass')) {
        delay = 450;
        batteryLevel -= 5; 
    } else {
        batteryLevel -= 3; 
    }

    
    batteryLevel = Math.max(batteryLevel, 0);

    document.getElementById("battery-level").textContent = batteryLevel + "%";

    if (batteryLevel == 0) {
        alert("Battery depleted. Robot cannot move.");
        return;
    }

    setTimeout(function () {
        path.shift();
        if (path.length > 0) {
            moveRobot();
        } else {
            var pathCells = document.querySelectorAll('.maze-cell[style="background-color: rgb(255, 165, 0);"]');
            for (var i = 0; i < pathCells.length; i++) {
                pathCells[i].style.backgroundColor = ''; 
            }
        }
    }, delay);
} else {
    alert("The robot cannot move to the next cell.");
}
}


function moveRobotToRandomCell() {
if (!mazeSize) {
    alert("Please generate the maze first.");
    return;
}

var randomRowRobot, randomColRobot, randomCellRobot;
var randomRowFlag, randomColFlag, randomCellFlag;


do {
    randomRowRobot = Math.floor(Math.random() * mazeSize);
    randomColRobot = Math.floor(Math.random() * mazeSize);
    randomCellRobot = document.getElementById(randomRowRobot + "-" + randomColRobot);
} while (randomCellRobot.classList.contains("wall"));


var edgePosition = Math.floor(Math.random() * 4); 


switch (edgePosition) {
    case 0: 
        randomRowFlag = 0;
        randomColFlag = Math.floor(Math.random() * mazeSize);
        break;
    case 1: 
        randomRowFlag = Math.floor(Math.random() * mazeSize);
        randomColFlag = mazeSize - 1;
        break;
    case 2:
        randomRowFlag = mazeSize - 1;
        randomColFlag = Math.floor(Math.random() * mazeSize);
        break;
    case 3: 
        randomRowFlag = Math.floor(Math.random() * mazeSize);
        randomColFlag = 0;
        break;
    default:
        break;
}
randomCellFlag = document.getElementById(randomRowFlag + "-" + randomColFlag);

while (randomCellFlag.classList.contains("wall") || (randomRowFlag === randomRowRobot && randomColFlag === randomColRobot)) {
    edgePosition = Math.floor(Math.random() * 4); 
    switch (edgePosition) {
        case 0: 
            randomRowFlag = 0;
            randomColFlag = Math.floor(Math.random() * mazeSize);
            break;
        case 1: 
            randomRowFlag = Math.floor(Math.random() * mazeSize);
            randomColFlag = mazeSize - 1;
            break;
        case 2: 
            randomRowFlag = mazeSize - 1;
            randomColFlag = Math.floor(Math.random() * mazeSize);
            break;
        case 3: 
            randomRowFlag = Math.floor(Math.random() * mazeSize);
            randomColFlag = 0;
            break;
        default:
            break;
    }
    randomCellFlag = document.getElementById(randomRowFlag + "-" + randomColFlag);
}


var robotCell = document.querySelector('.maze-cell.start');
var flagCell = document.querySelector('.maze-cell.end');

robotCell.classList.remove('start');
flagCell.classList.remove('end');

randomCellRobot.classList.add('start');
randomCellFlag.classList.add('end');

randomCellRobot.scrollIntoView({ behavior: 'smooth', block: 'center' });

}

var maxBatteryLevel = 100;
function chargeBattery() {
if (batteryLevel == maxBatteryLevel) {
    alert("Battery is already fully charged.");
    moveRobot();
    return;
}
var chargingInterval = setInterval(function() {
    batteryLevel += 10;

    batteryLevel = Math.min(batteryLevel, maxBatteryLevel);

    console.log("Battery level:", batteryLevel);

    document.getElementById("battery-level").textContent = batteryLevel + "(%)⚡ ";
    if (batteryLevel == maxBatteryLevel ) {
        clearInterval(chargingInterval); 
        alert("Battery fully charged.");
        if (path.length > 0){
        moveRobot();
    }     
    }
}, 1000); 
}  