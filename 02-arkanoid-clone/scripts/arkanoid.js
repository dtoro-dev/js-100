const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const livesElement = document.querySelector(".lives-count");
const scoreElement = document.querySelector(".score-count");
const spriteSpace = document.querySelector(".sprite");
const spriteBall = document.querySelector(".ball");

// TAMAÑO CANVAS
canvas.width = 800;
canvas.height = 600;
// TAMAÑO BOLA
const ballRadius = 4;
// POSICIÓN
let x = canvas.width / 2;
let y = canvas.height - 30;
// VELOCIDAD
let dx = -3;
let dy = -3;
// PADDLE
const paddleHeight = 10;
const paddleWidth = 75;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 10;

let rightPressed = false;
let leftPressed = false;

// LIFES
let livesTotal = 2;
let lives = livesTotal;

for (let i = 0; i < livesTotal; i++) {
  livesElement.innerHTML += `❤️`;
}

// VARIABLES DE LOS LADRILLOS
const brickRowCount = 18;
const brickColumnCount = 23;
const brickWidth = 30;
const brickHeight = 14;
const brickPadding = 2;
const brickOffsetTop = 50;
const brickOffsetLeft = 30;
let wall = [];
const bricks = [
  { color: "red", points: 1 },
  { color: "orange", points: 2 },
  { color: "yellow", points: 3 },
  { color: "green", points: 4 },
  { color: "blue", points: 5 },
  { color: "lightblue", points: 6 },
  { color: "pink", points: 7 },
  { color: "white", points: 8 },
  { color: "silver", points: 100 },
  { color: "gold", points: 1000 },
];

// ITERACIÓN DE MURALLA DE LADRILLOS
for (let c = 0; c < brickColumnCount; c++) {
  wall[c] = [];

  for (let r = 0; r < brickRowCount; r++) {
    //calculo de la posición de cada ladrillo
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

    wall[c][r] = { x: brickX, y: brickY, status: 1 };

    let random = Math.floor(Math.random() * 10);

    wall[c][r] = {
      ...bricks[random],
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
    };
  }
}


const drawBall = () => {
  ctx.beginPath();
  ctx.drawImage(spriteSpace, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
  ctx.closePath();
};

const drawPaddle = () => {
  ctx.beginPath();
  ctx.drawImage(spriteSpace, paddleX, paddleY, paddleWidth, paddleHeight);
  ctx.closePath();
};

const drawBricks = () => {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (wall[c][r].status === BRICK_STATUS.ACTIVE) {
        ctx.beginPath();
        const currentBrick = wall[c][r];

        if (currentBrick.status === BRICK_STATUS.DESTROY) continue;

        let imageBrick = document.querySelector(`.brick-${currentBrick.color}`);
        ctx.drawImage(imageBrick, currentBrick.x, currentBrick.y, brickWidth, brickHeight);
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.closePath();
      }
    }
  }
};

const drawLives = () => {
  soundPress("death");

  livesElement.innerHTML = "";
  lives--;

  for (let i = 0; i < lives; i++) {
    livesElement.innerHTML += `❤️`;
  }

  for (let i = lives; i < livesTotal; i++) {
    livesElement.innerHTML += `💔`;
  }

  if (!lives) {
    dx = 0;
    dy = 0;

    setTimeout(() => {
      soundPress("end");

      let startPage = document.querySelector(".start-page");
      let endPage = document.querySelector(".end-page");

      startPage.classList.add("hidden");
      endPage.classList.remove("hidden");

      livesElement.innerHTML = "";
      lives = livesTotal;
    }, 1000);

    return false;
  }
};

const collisionDetection = () => {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const brick = wall[c][r];

      if (brick.status === BRICK_STATUS.DESTROY) continue;

      const isBallTouchingBrick =
        x > brick.x &&
        x < brick.x + brickWidth &&
        y > brick.y &&
        y < brick.y + brickHeight;

      if (isBallTouchingBrick) {
        soundPress("hit");
        dy = -dy;
        brick.status = BRICK_STATUS.DESTROY;
        SCORE += brick.points;

        scoreElement.innerHTML = SCORE.toString().padStart(10, "0");
      }
    }
  }
};

const ballMovement = () => {
  // colisión pared derecha / izquierda
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
    soundPress("bound");
  }
  // colisión pared arriba
  if (y + dy < ballRadius) {
    dy = -dy;
    soundPress("bound");
  }
  // colisión pared abajo game over
  const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
  const isBallTouchingPaddle =
    y + dy > paddleY - ballRadius && y + dy < paddleY + paddleHeight + ballRadius;

  if (isBallTouchingPaddle && isBallSameXAsPaddle) {
    soundPress("punch");
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = -3;
    dy = -3;

    drawLives();
  }

  x += dx;
  y += dy;
};

const paddleMovement = () => {
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SPEED;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SPEED;
  }
};

const cleanCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const keyDownHandler = (event) => {
  if (event.key === "Right" || event.key === "ArrowRight") {
    rightPressed = true;
  } else if (event.key === "Left" || event.key === "ArrowLeft") {
    leftPressed = true;
  }

  if (event.key === "Escape") {
    canvas.style.backgroundImage = `url('images/backgrounds/${randomBackground()}.png')`;
    RESTART_GAME = true;
  }
};

const keyUpHandler = (event) => {
  if (event.key === "Right" || event.key === "ArrowRight") {
    rightPressed = false;
  } else if (event.key === "Left" || event.key === "ArrowLeft") {
    leftPressed = false;
  }
};

const initEvent = () => {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  canvas.style.backgroundImage = `url('images/backgrounds/${randomBackground()}.png')`;
  scoreElement.innerHTML = SCORE.toString().padStart(10, "0")
};

const restartGame = () => {
  if (RESTART_GAME) {
    lives = livesTotal;
    x = canvas.width / 2;
    y = canvas.height - 30;
    // VELOCIDAD
    dx = -3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    paddleY = canvas.height - paddleHeight - 10;

    livesElement.innerHTML = "";

    for (let i = 0; i < lives; i++) {
      livesElement.innerHTML += `❤️`;
    }

    RESTART_GAME = false;
    PAUSED_GAME = false;

    wall = [];

    for (let c = 0; c < brickColumnCount; c++) {
      wall[c] = [];
    
      for (let r = 0; r < brickRowCount; r++) {
        //calculo de la posición de cada ladrillo
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    
        wall[c][r] = { x: brickX, y: brickY, status: 1 };
    
        let random = Math.floor(Math.random() * 10);
    
        wall[c][r] = {
          ...bricks[random],
          x: brickX,
          y: brickY,
          status: BRICK_STATUS.ACTIVE,
        };
      }
    }

    canvas.style.backgroundImage = `url('images/backgrounds/${randomBackground()}.png')`;
  }
};

const draw = () => {
  if (!document.querySelector(".start-page").classList.contains("hidden")) {
    cleanCanvas();

    drawBall();
    drawPaddle();
    drawBricks();

    collisionDetection();

    if (!PAUSED_GAME) {
      ballMovement();
      paddleMovement();
    } else {

    }

    restartGame();
  }


  window.requestAnimationFrame(draw);
};

draw();
initEvent();
