let SCORE = 0;
let RESTART_GAME = false;
let PADDLE_SPEED = 7;
let PAUSED_GAME = false;
const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROY: 0
}

const randomBackground = () => {
  const randomNumber = Math.random();
  return Math.floor(randomNumber * 6) + 1;
}