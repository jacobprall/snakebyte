import eatPath from "./audio/eat.mp3";
import turnPath from "./audio/turn.mp3";
import deadPath from "./audio/dead.mp3";
import hitPath from "./audio/hit.mp3";
import backgroundPath from "./audio/background-music.mp3";
import upPath from "./images/up.png";
import downPath from "./images/down.png";
import leftPath from "./images/left.png";
import rightPath from "./images/right.png";
import {
  drawGlobalHighScores,
  getLocalHighScore,
  getValueFromLocalStorage,
  setValueInLocalStorage,
} from "./utils";
import { createUserInputPopup, revealEventLink } from "./ui";
import { getGlobalHighScores, handleHighScoreSubmit } from "./db/highScores";

/**
 * HTML Elements and Global Game State
 */

document.addEventListener("DOMContentLoaded", async () => {
  const board = document.getElementById("game-board");
  const score = document.getElementById("score");
  const highScoreText = document.getElementById("highScore");

  const images = {
    source: [
      "hubspot",
      "github",
      "salesforce",
      "slack",
      "bigquery",
      "s3",
      "snowflake",
      "redshift",
    ],
  };
  const isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    },
  };

  if (isMobile.any()) {
    let x1: number | null = null;
    let y1: number | null = null;

    function handleTouchStart(event: TouchEvent) {
      const firstTouch = event.touches[0];
      x1 = firstTouch.clientX;
      y1 = firstTouch.clientY;

      if (!gameStarted) {
        startGame();
      }
    }

    function handleTouchMove(event: TouchEvent) {
      event.preventDefault();
      if (!x1 || !y1) return false; // check swipe
      if (!gameStarted) return false;
      let x2 = event.touches[0].clientX;
      let y2 = event.touches[0].clientY;

      let xDiff = x2 - x1;
      let yDiff = y2 - y1;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // swipe left or right
        xDiff > 0 ? (direction = "right") : (direction = "left");
      } else {
        event.preventDefault();
        // swipe up or down
        yDiff < 0 ? (direction = "up") : (direction = "down");
      }
    }

    board?.addEventListener("touchstart", handleTouchStart);
    board?.addEventListener("touchmove", handleTouchMove);
  }

  // Define game variables
  const gridSize = isMobile.any() ? 15 : 20;
  let snake = [{ x: 10, y: 10 }];
  let consumables: Consumables[] = [];
  let direction: "right" | "left" | "up" | "down" = "right";
  let gameInterval: any;
  let gameSpeedDelay = 200;
  let gameStarted = false;

  /**
   * Helpers
   *
   */

  function getClearPosition() {
    const occupiedPositions = snake
      .map((segment) => `${segment.x}-${segment.y}`)
      .concat(
        consumables.map((consumable) => `${consumable.x}-${consumable.y}`)
      );
    let x = Math.floor(Math.random() * gridSize) + 1;
    let y = Math.floor(Math.random() * gridSize) + 1;

    while (occupiedPositions.includes(`${x}-${y}`)) {
      x = Math.floor(Math.random() * gridSize) + 1;
      y = Math.floor(Math.random() * gridSize) + 1;
    }

    return { x, y };
  }

  const handleHighScoreSubmitCb = async (username: string, score: number) => {
    await handleHighScoreSubmit(username, score);
    const newGlobalHighScores = await getGlobalHighScores();
    setValueInLocalStorage("globalHighScores", newGlobalHighScores);
    drawGlobalHighScores(newGlobalHighScores);
  };

  async function updateGlobalHighScore(score: number) {
    const globalHighScores = getValueFromLocalStorage(
      "globalHighScores",
      []
    ) as [string, number][];
    const globalLowestHighScore = globalHighScores.slice(-1)[0][1];
    if (score > globalLowestHighScore) {
      createUserInputPopup({
        onSubmit: (username: string) =>
          handleHighScoreSubmitCb(username, score),
        onCancel: () => console.log("Popup canceled"),
      });
    }
  }

  function updateLocalHighScore(score: number) {
    const highScore = getLocalHighScore();
    if (score > highScore) {
      setValueInLocalStorage("highScore", score);
    }

    highScoreText!.textContent = getLocalHighScore().toString();
  }

  /**
   * Consumable Effects
   */

  interface Consumables {
    applyEffect: () => void;
    type: "source" | "bug";
    x: number;
    y: number;
    img?: string;
  }

  class Consumable implements Consumables {
    type: "source" = "source";
    x: number;
    y: number;
    img: string;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.img =
        images.source[Math.floor(Math.random() * images.source.length)];
    }
    applyEffect() {
      audioTurn.play();
      snake.push({ ...snake[snake.length - 1] });
      changeSpeed();
      clearInterval(gameInterval);
      const { x, y } = getClearPosition(); // Clear past interval
      consumables.push(new Consumable(x, y));
      // 30% chance of adding a new consumable
      const random = Math.floor(Math.random() * 3);
      if (random === 0) {
        consumables.push(generateRandomConsumable());
      }
      gameInterval = setInterval(() => {
        gameLoop();
      }, gameSpeedDelay);
    }
  }

  class Bug implements Consumables {
    type: "bug" = "bug";
    x: number;
    y: number;
    img: string = "bug";
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.img = "bug";
    }
    applyEffect() {
      audioDead.play();
      resetGame();
    }
  }

  /**
   * A/V Assets
   */
  const audio = [eatPath, turnPath, deadPath, hitPath, backgroundPath];
  const audioNames = Array.from({ length: audio.length }, () => new Audio());
  for (let i = 0; i < audio.length; i++) {
    audioNames[i].src = audio[i];
  }

  // const audioEat = audioNames[0];
  const audioTurn = audioNames[1];
  const audioDead = audioNames[2];
  // const audioHit = audioNames[3];
  const audioBackground = audioNames[4];

  const muteButton = document.querySelector("#toggle-music");

  muteButton?.addEventListener("click", () => {
    if (audioBackground.paused) {
      audioBackground.play();
    } else {
      audioBackground.pause();
    }
  });

  const eyesByDirection = {
    up: upPath,
    down: downPath,
    left: leftPath,
    right: rightPath,
  };

  const headShapeByDirection = {
    up: "3px 3px 0 0",
    down: "0 0 3px 3px",
    left: "3px 0 0 3px",
    right: "0 3px 3px 0",
    start: "3px 3px 3px 3px",
  };

  /**
   * Game Logic
   */

  // Helpers
  function createGameElement(tag: string, className: string, img?: string) {
    const element = document.createElement(tag);
    element.className = className + " " + (img ? img : "");
    return element;
  }

  function setPosition(
    element: HTMLElement,
    position: { x: number; y: number }
  ) {
    element.style.gridColumn = String(position.x);
    element.style.gridRow = String(position.y);
  }

  // Draw methods
  function draw() {
    board!.innerHTML = "";
    drawSnake();
    drawConsumables();
    updateScore();
  }

  function drawSnake() {
    snake.forEach((segment, i) => {
      const snakeElement = createGameElement("div", "snake");
      setPosition(snakeElement, segment);
      if (i === 0) {
        snakeElement.style.backgroundImage = `url(${eyesByDirection[direction]})`;
        snakeElement.style.backgroundSize = "cover";
        snakeElement.style.borderRadius = headShapeByDirection[direction];
      }
      if (snake.length === 1) {
        snakeElement.style.borderRadius = headShapeByDirection["start"];
      }
      board?.appendChild(snakeElement);
    });
  }

  function drawConsumables() {
    consumables.forEach((consumable) => {
      const consumableElement = createGameElement(
        "div",
        consumable.type,
        consumable?.img
      );

      setPosition(consumableElement, consumable);

      board?.appendChild(consumableElement);
    });
  }

  // Collision logic

  function checkCollisionWithConsumables() {
    const head = snake[0];
    consumables.forEach((consumable, index) => {
      if (head.x === consumable.x && head.y === consumable.y) {
        consumable.applyEffect();
        consumables.splice(index, 1);
      }
    });
  }

  function generateConsumable(type: "file" | "source" | "bug"): Consumables {
    const { x, y } = getClearPosition();
    if (type === "source") {
      const sourceConsumable = new Consumable(x, y);
      return sourceConsumable;
    }
    if (type === "bug") {
      const bugConsumable = new Bug(x, y);
      return bugConsumable;
    }

    return new Consumable(x, y);
  }

  function generateRandomConsumable() {
    const random = Math.floor(Math.random() * 3);
    const type = ["file", "source", "bug"][random] as "file" | "source" | "bug";
    return generateConsumable(type);
  }

  // Moving the snake
  function move() {
    const head = { ...snake[0] };
    switch (direction) {
      case "up":
        head.y--;
        break;
      case "down":
        head.y++;
        break;
      case "left":
        head.x--;
        break;
      case "right":
        head.x++;
        break;
    }

    snake.unshift(head);
    checkCollisionWithConsumables();
    snake.pop();
  }

  function gameLoop() {
    move();
    checkCollision();
    draw();
  }

  // Start game function
  function startGame() {
    audioBackground.play();
    // toggleInstructions();
    gameStarted = true; // Keep track of a running game
    const highScore = getLocalHighScore();
    highScoreText!.textContent = highScore.toString();
    consumables.push(generateConsumable("source"), generateConsumable("bug"));
    gameInterval = setInterval(() => {
      gameLoop();
    }, gameSpeedDelay);
  }

  // Keypress event listener
  function handleKeyPress(event: KeyboardEvent) {
    if (
      (!gameStarted && event.code === "Space") ||
      (!gameStarted && event.key === " ")
    ) {
      event.preventDefault();
      startGame();
    } else {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          // audioTurn.play();
          direction = "up";
          break;
        case "ArrowDown":
          event.preventDefault();
          // audioTurn.play();
          direction = "down";
          break;
        case "ArrowLeft":
          event.preventDefault();
          // audioTurn.play();
          direction = "left";
          break;
        case "ArrowRight":
          event.preventDefault();
          // audioTurn.play();
          direction = "right";
          break;
      }
    }
  }

  document.addEventListener("keydown", handleKeyPress);

  function changeSpeed() {
    if (gameSpeedDelay > 150) {
      gameSpeedDelay -= 5;
    } else if (gameSpeedDelay > 100) {
      gameSpeedDelay -= 3;
    } else if (gameSpeedDelay > 50) {
      gameSpeedDelay -= 2;
    } else if (gameSpeedDelay > 25) {
      gameSpeedDelay -= 1;
    }
  }

  function checkCollision() {
    const head = snake[0] ?? { x: -1, y: -1 };

    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
      audioDead.play();
      resetGame();
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        audioDead.play();
        resetGame();
      }
    }
  }

  function resetGame() {
    stopGame();
    snake = [{ x: 10, y: 10 }];
    consumables = [generateConsumable("file"), generateConsumable("source")];
    direction = "right";
    gameSpeedDelay = 200;
  }

  function updateScore() {
    score!.textContent = snake.length.toString();
  }

  async function stopGame() {
    const score = snake.length;
    revealEventLink();
    updateGlobalHighScore(score);
    updateLocalHighScore(score);
    clearInterval(gameInterval);
    gameStarted = false;
    addInstructions();
  }
  const addInstructions = () => {
    const instruction = document.createElement("div");
    instruction.setAttribute("id", "instruction");
    const instructionText = document.createElement("h1");
    instructionText.setAttribute("id", "instruction-text");
    instructionText.textContent = "Press spacebar to start the game";
    instruction.appendChild(instructionText);
    console.log(instruction);
    console.log(board);
    board!.appendChild(instruction);
    console.log(board);
  };
});
