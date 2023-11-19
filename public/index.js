// Deklaracija globalnih varijabli
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerSize = 30;
const asteroidSize = 30;
const playerColor = 'red';
const asteroidColor = 'gray';
let asteroids = [];
const minAsteroidSpeed = 1;
const maxAsteroidSpeed = 5;
let playerX, playerY, playerSpeed, bestTime, time, difficulty = 3;
let firstTime = true

// Inicijalizacija igre
function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    playerX = canvas.width / 2 - playerSize / 2;
    playerY = canvas.height / 2 - playerSize / 2;
    playerSpeed = 15;
    bestTime = localStorage.getItem('bestTime') || 0;
    time = Date.now();
    console.log(time);
    initAsteroids();
    if(firstTime) {

        // Postavljanje event listenera za tipkovnicu
        window.addEventListener('keydown', (event) => movePlayer(event));

    // Glavna petlja igre

        setInterval(update, 16);
        
        // Povećava broj asteroida i brzinu svakih deset sekundi
        setInterval(function() {
            increaseDifficulty(difficulty++);
        }, 10000);
    }
    
}

// Funkcija za svaki korak igre
function update() {
    moveAsteroids();
    checkCollision();
    draw();
}

// Funkcija za crtanje igre
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Crta igrača
    ctx.fillStyle = playerColor;
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Crta asteroide
    ctx.fillStyle = asteroidColor;
    for (const asteroid of asteroids) {
        ctx.beginPath();
        ctx.arc(
            asteroid.x + asteroidSize / 2,
            asteroid.y + asteroidSize / 2,
            asteroidSize / 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();
    }

    // Crta najbolje vrijeme
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Najbolje vrijeme: ${formatTime(bestTime)}`, 10, 30);
}

// Funkcija za pomak igrača
function movePlayer(event) {
    switch (event.key) {
        case 'w':
            playerY -= playerSpeed;
            break;
        case 'a':
            playerX -= playerSpeed;
            break;
        case 's':
            playerY += playerSpeed;
            break;
        case 'd':
            playerX += playerSpeed;
            break;
    }

    // Igrač prelazi s jedne strane ekrana na drugu
    if (playerX < 0) {
        playerX = canvas.width - playerSize;
    } else if (playerX > canvas.width - playerSize) {
        playerX = 0;
    }

    if (playerY < 0) {
        playerY = canvas.height - playerSize;
    } else if (playerY > canvas.height - playerSize) {
        playerY = 0;
    }
}

// Funkcija za pomak asteroida
function moveAsteroids() {
    for (const asteroid of asteroids) {
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;

        /* Optional: Wrap asteroids around the screen
        if (
            asteroid.x + asteroidSize < 0 ||
            asteroid.x > canvas.width ||
            asteroid.y + asteroidSize < 0 ||
            asteroid.y > canvas.height
        ) {
            repositionAsteroid(asteroid);
        }*/
    }
}

function repositionAsteroid(asteroid) {
    const side = Math.floor(Math.random() * 4);

    switch (side) {
        case 0: // Top
            asteroid.x = Math.random() * canvas.width;
            asteroid.y = -asteroidSize;
            break;
        case 1: // Right
            asteroid.x = canvas.width + asteroidSize;
            asteroid.y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            asteroid.x = Math.random() * canvas.width;
            asteroid.y = canvas.height + asteroidSize;
            break;
        case 3: // Left
            asteroid.x = -asteroidSize;
            asteroid.y = Math.random() * canvas.height;
            break;
    }
}

// Funkcija za detekciju kolizije
function checkCollision() {
    for (const asteroid of asteroids) {
        if (
            playerX < asteroid.x + asteroidSize &&
            playerX + playerSize > asteroid.x &&
            playerY < asteroid.y + asteroidSize &&
            playerY + playerSize > asteroid.y
        ) {
            // Kolizija se dogodila
            endGame();
        }
    }
}

// Funkcija za povećanje broja asteroida i brzine
function increaseDifficulty(difficulty) {
    console.log("Difficulty increased by: " + difficulty);
    initAsteroids(difficulty);
}

// Initialize asteroids
// Funkcija za inicijalizaciju asteroida
function initAsteroids(amount = 10) {
    for (let i = 0; i < amount; i++) {
        let x, y;

        // Postavi asteroid izvan ekrana
        if (Math.random() < 0.5) {
            // Početak iznad ili ispod ekrana
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? -asteroidSize : canvas.height + asteroidSize;
        } else {
            // Početak lijevo ili desno od ekrana
            x = Math.random() < 0.5 ? -asteroidSize : canvas.width + asteroidSize;
            y = Math.random() * canvas.height;
        }

        // Postavi smjer prema nasumičnoj točki unutar granica ekrana
        const randomTargetX = Math.random() * canvas.width;
        const randomTargetY = Math.random() * canvas.height;
        const angle = Math.atan2(randomTargetY - y, randomTargetX - x);
        const speedX = minAsteroidSpeed * Math.cos(angle);
        const speedY = minAsteroidSpeed * Math.sin(angle);

        asteroids.push({ x, y, speedX, speedY });
    }
}




function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    const formattedTime = `${pad(remainingHours)}:${pad(remainingMinutes)}:${pad(remainingSeconds)}`;
    return formattedTime;
}

function pad(number) {
    return (number < 10 ? '0' : '') + number;
}


function endGame() {
    // Zaustavljanje igre
    firstTime = false;
    window.removeEventListener('keydown', movePlayer);
    asteroids = [];
    time = Date.now() - time;
    console.log(time);
    // Provjera je li ostvareno najbolje vrijeme
    if (bestTime == 0 || bestTime < time) {
        bestTime = time;
        localStorage.setItem('bestTime', bestTime);
    }

    // Resetiranje igre
    initGame();
}

window.onload = function () {
    initGame();
};
