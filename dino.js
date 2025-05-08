const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const gameOverText = document.getElementById("gameOver");
const jumpSound = document.getElementById("jumpSound");
const bgMusic = document.getElementById("bgMusic");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const toggleBtn = document.getElementById("toggleModeBtn");

// Lives Display
const livesDisplay = document.createElement("div");
livesDisplay.id = "lives";
livesDisplay.style.position = "absolute";
livesDisplay.style.top = "20px";
livesDisplay.style.right = "20px";
livesDisplay.style.color = "cyan";
livesDisplay.style.fontSize = "1.5rem";
livesDisplay.style.textShadow = "0 0 10px cyan";
livesDisplay.style.zIndex = "2";
document.querySelector(".game").appendChild(livesDisplay);

// Game variables
let score = 0;
let lives = 3;
let gameRunning = true;
let cactusSpeed = 2.0;
let speedUpdatePending = false;
let cactus2 = null;
let cactus2Active = false;

// Jump function
function jump() {
  if (!dino.classList.contains("jump") && gameRunning) {
    dino.classList.add("jump");
    jumpSound.currentTime = 0;
    jumpSound.play();
    setTimeout(() => {
      dino.classList.remove("jump");
    }, 500);
  }
}

// Keyboard event
document.addEventListener("keydown", function (event) {
  if (event.code === "Space" || event.code === "ArrowUp") {
    jump();
  }
});

// Update cactus animation speed
function updateCactusSpeed() {
  cactus.style.animation = "none";
  void cactus.offsetWidth;
  cactus.style.animation = `moveCactus ${cactusSpeed}s linear infinite`;

  if (cactus2Active && cactus2) {
    cactus2.style.animation = "none";
    void cactus2.offsetWidth;
    cactus2.style.animation = `moveCactus ${cactusSpeed}s linear infinite`;
  }
}
updateCactusSpeed();

// Update lives UI
function updateLivesDisplay() {
  livesDisplay.textContent = "Lives: " + lives;
}

// Show game over screen
function showGameOver() {
  gameOverText.style.display = "block";
  restartBtn.style.display = "block";
  cactus.style.animation = "none";
  if (cactus2) cactus2.style.animation = "none";
  gameRunning = false;
}

// Restart game
restartBtn.addEventListener("click", () => {
  location.reload();
});

// Auto night mode based on time
function checkNightMode() {
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;
  if (isNight) {
    document.body.classList.add("night-mode");
    toggleBtn.textContent = "☀️ Mode Siang";
  }
}
checkNightMode();

// Manual night/light toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("night-mode");
  toggleBtn.textContent = document.body.classList.contains("night-mode")
    ? "☀️ Mode Siang"
    : "🌙 Mode Malam";
});

// Background music
window.onload = () => {
  bgMusic.volume = 0.3;
  bgMusic.loop = true;
  bgMusic.play();
  updateLivesDisplay();
};

// Collision check
let isAlive = setInterval(() => {
  if (!gameRunning) return;

  const dinoBox = dino.getBoundingClientRect();
  const cactusBox = cactus.getBoundingClientRect();

  // Collision with cactus 1
  if (
    dinoBox.right > cactusBox.left &&
    dinoBox.left < cactusBox.right &&
    dinoBox.bottom > cactusBox.top &&
    dinoBox.top < cactusBox.bottom
  ) {
    handleCollision();
  }

  // Collision with cactus 2
  if (cactus2Active && cactus2) {
    const cactus2Box = cactus2.getBoundingClientRect();
    if (
      dinoBox.right > cactus2Box.left &&
      dinoBox.left < cactus2Box.right &&
      dinoBox.bottom > cactus2Box.top &&
      dinoBox.top < cactus2Box.bottom
    ) {
      handleCollision();
    }
  }
}, 10);

let invincible = false; // cooldown setelah tabrakan

function handleCollision() {
  if (invincible || !gameRunning) return;

  // Play hit sound
  const boinkSound = document.getElementById("boinkSound");
  if (boinkSound) {
    boinkSound.currentTime = 0;
    boinkSound.play();
  }

  lives--;
  updateLivesDisplay();
  invincible = true;

  // Dino berkedip sebagai efek "tertabrak"
  dino.style.opacity = "0.5";
  setTimeout(() => {
    dino.style.opacity = "1";
    invincible = false;
  }, 1000); // 1 detik invincible biar gak langsung tabrakan lagi

  if (lives <= 0) {
    showGameOver();
    score = 0; // Reset skor saat game over
    scoreDisplay.textContent = "Score: 0";
  }
}

// Score and speed update
cactus.addEventListener("animationiteration", () => {
  if (!gameRunning) return;

  score++;
  scoreDisplay.textContent = "Score: " + score;

  // Bonus life every 5 points, max 3
  if (score % 5 === 0 && lives < 3) {
    lives++;
    updateLivesDisplay();
  }

  // Increase speed every 7 points
  if (score % 7 === 0 && !speedUpdatePending) {
    speedUpdatePending = true;
    cactusSpeed = Math.max(0.6, cactusSpeed - 0.2); // minimum speed limit
    updateCactusSpeed();
  }
  if (score % 7 !== 0) {
    speedUpdatePending = false;
  }

  // Add second cactus
  if (score % 10 === 0 && !cactus2Active) {
    cactus2 = document.createElement("div");
    cactus2.id = "cactus2";
    cactus2.style.position = "absolute";
    cactus2.style.bottom = "0";
    cactus2.style.left = "100vw";
    cactus2.style.width = "30px";
    cactus2.style.height = "50px";
    cactus2.style.background = "hotpink";
    cactus2.style.boxShadow = "0 0 15px hotpink";
    cactus2.style.animation = `moveCactus ${cactusSpeed}s linear infinite`;
    document.querySelector(".game").appendChild(cactus2);
    cactus2Active = true;
  }
});
