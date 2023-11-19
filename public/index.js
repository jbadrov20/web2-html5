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
let firstTime = true;

// Inicijalizacija igre
function initGame() {
    // Postavljanje veličine igračkog platna
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Postavljanje početne pozicije igrača
    playerX = canvas.width / 2 - playerSize / 2;
    playerY = canvas.height / 2 - playerSize / 2;

    // Postavljanje brzine igrača
    playerSpeed = 15;

    // Postavljanje početnog najboljeg vremena iz lokalne pohrane
    bestTime = localStorage.getItem('bestTime') || 0;

    // Postavljanje trenutnog vremena
    time = Date.now();
    console.log(time);

    // Inicijalizacija asteroida
    initAsteroids();

    // Postavljanje event listenera za tipkovnicu ako je prvi put
    if (firstTime) {
        window.addEventListener('keydown', (event) => movePlayer(event));

        // Postavljanje glavne petlje igre
        setInterval(update, 16);

        // Povećava broj asteroida i brzinu svakih deset sekundi
        setInterval(() => increaseDifficulty(difficulty++), 10000);
    }
}

// Funkcija za svaki korak igre
function update() {
    // Pomiči asteroide, provjeri koliziju i iscrtaj
    moveAsteroids();
    checkCollision();
    draw();
}

// Funkcija za crtanje igre
function draw() {
    // Očisti platno
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Crta gornji dio sjene
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(playerX, playerY, playerSize, playerSize / 2);

    // Crta donji dio sjene
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(playerX, playerY + playerSize / 2, playerSize, playerSize / 2);
    
    // Crta igrača
    ctx.fillStyle = playerColor;
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Crta asteroide
    ctx.fillStyle = asteroidColor;
    for (const asteroid of asteroids) {
        const gradient = ctx.createLinearGradient(
            asteroid.x,
            asteroid.y,
            asteroid.x + asteroidSize,
            asteroid.y + asteroidSize
        );
    
        // Postavljanje nijansi sive boje
        gradient.addColorStop(0, '#666'); // Darker shade
        gradient.addColorStop(0.5, '#999'); // Medium shade
        gradient.addColorStop(1, '#ccc'); // Lighter shade
    
        // Crta pravokutnik asteroida s nijansama sive boje
        ctx.fillStyle = gradient;
        ctx.fillRect(asteroid.x, asteroid.y, asteroidSize, asteroidSize);
    
        // Dodaje 3D efekt oko ruba pravokutnika
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(asteroid.x, asteroid.y, asteroidSize, asteroidSize / 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(asteroid.x, asteroid.y + asteroidSize / 2, asteroidSize, asteroidSize / 2);
    }

    // Crta najbolje vrijeme
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Najbolje vrijeme: ${formatTime(bestTime)}`, 10, 30);
    ctx.fillText(`Trenutno vrijeme: ${formatTime(Date.now() - time)}`, 10, 60);
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
    }
}

// Funkcija za ponovno postavljanje asteroida izvan ekrana
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
    let i = 0;
    if(i++ % 4 == 3 && minAsteroidSpeed < maxAsteroidSpeed){
        minAsteroidSpeed++;
    }
    initAsteroids(difficulty);
}

// Inicijalizacija asteroida
// Funkcija za postavljanje asteroida na početku igre
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

// Funkcija za formatiranje vremena
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    return `${pad(remainingHours)}:${pad(remainingMinutes)}:${pad(remainingSeconds)}`;
}

// Pomoćna funkcija za dodavanje nula ispred jednocifrenih brojeva
function pad(number) {
    return (number < 10 ? '0' : '') + number;
}

// Funkcija koja se poziva kada igra završi
function endGame() {
    firstTime = false;
    window.removeEventListener('keydown', movePlayer);
    asteroids = [];
    time = Date.now() - time;

    // Provjera je li ostvareno najbolje vrijeme
    if (bestTime == 0 || bestTime < time) {
        bestTime = time;
        localStorage.setItem('bestTime', bestTime);
    }

    // Resetiranje igre
    initGame();
}

// Postavljanje igre nakon učitavanja stranice
window.onload = function () {
    initGame();
};
