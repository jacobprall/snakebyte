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
import { createUserInputPopup } from "./ui";
import { getGlobalHighScores, handleHighScoreSubmit } from "./api/highScores";
import { Snake } from "./models/Snake";
import { Renderer } from "./models/Renderer";
import { AudioManager } from "./models/AudioManager";
import { InputManager } from "./models/InputManager";

/**
 * HTML Elements and Global Game State
 */

const renderer = new Renderer();

document.addEventListener("DOMContentLoaded", async () => {
  const front = document.getElementById("front");
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

  // const inputManager = new InputManager(game);
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
  let snake = new Snake({ x: 10, y: 10 });
  let consumables: Consumables[] = [];
  let direction: "right" | "left" | "up" | "down" = "right";
  let gameInterval: any;
  let gameSpeedDelay = 200;
  let gameStarted = false;
  const backgroundAudioManager = new AudioManager();

  /**
   * Helpers
   *
   */

  function getClearPosition() {
    const occupiedPositions = snake.segments
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
    audioManager: AudioManager;
  }

  class Consumable implements Consumables {
    type: "source" = "source";
    x: number;
    y: number;
    img: string;
    audioManager = new AudioManager();

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.img =
        images.source[Math.floor(Math.random() * images.source.length)];
    }
    applyEffect() {
      this.audioManager.playSound("turn");
      snake.grow();
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
    audioManager = new AudioManager();

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.img = "bug";
    }
    applyEffect() {
      this.audioManager.playSound("dead");
      resetGame();
    }
  }

  const muteButton = document.querySelector("#toggle-music");
  const textIcon = document.getElementById("text-icon");

  muteButton?.addEventListener("click", () => {
    if (backgroundAudioManager.isBackgroundPlaying()) {
      // play audio emoji
      textIcon!.innerHTML = "⏹️";
      backgroundAudioManager.playBackground();
    } else {
      textIcon!.innerHTML = "🔊";
      backgroundAudioManager.stopBackground();
    }
  });

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
    renderer.drawSnake(snake, direction);
    drawConsumables();
    updateScore();
  }

  // function drawSnake() {
  //   snake.forEach((segment, i) => {
  //     const snakeElement = createGameElement("div", "snake");
  //     setPosition(snakeElement, segment);
  //     if (i === 0) {
  //       snakeElement.style.backgroundImage = `url(${eyesByDirection[direction]})`;
  //       snakeElement.style.backgroundSize = "cover";
  //       snakeElement.style.borderRadius = headShapeByDirection[direction];
  //     }
  //     if (snake.length === 1) {
  //       snakeElement.style.borderRadius = headShapeByDirection["start"];
  //     }
  //     board?.appendChild(snakeElement);
  //   });
  // }

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
    const head = snake.segments[0];
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
    const head = { ...snake.segments[0] };
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

    snake.segments.unshift(head);
    checkCollisionWithConsumables();
    snake.segments.pop();
  }

  function gameLoop() {
    move();
    checkCollision();
    draw();
  }

  // Start game function
  function startGame() {
    backgroundAudioManager.playBackground();
    toggleInstructions(true);
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
          // audioManager.play();
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
    const head = snake.segments[0] ?? { x: -1, y: -1 };

    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
      backgroundAudioManager.playSound("dead");
      resetGame();
    }

    for (let i = 1; i < snake.segments.length; i++) {
      if (head.x === snake.segments[i].x && head.y === snake.segments[i].y) {
        backgroundAudioManager.playSound("dead");
        resetGame();
      }
    }
  }

  function resetGame() {
    stopGame();
    snake = new Snake({ x: 10, y: 10 });
    consumables = [generateConsumable("file"), generateConsumable("source")];
    direction = "right";
    gameSpeedDelay = 200;
  }

  function updateScore() {
    score!.textContent = snake.segments.length.toString();
  }

  async function stopGame() {
    const score = snake.segments.length;
    updateGlobalHighScore(score);
    updateLocalHighScore(score);
    clearInterval(gameInterval);
    gameStarted = false;
    toggleInstructions();
  }
  const toggleInstructions = (clear?: boolean) => {
    const instruction = document.getElementById("instruction");

    if (clear) {
      if (instruction) {
        instruction.remove();
      }
      return;
    }

    if (instruction) {
      return;
    }
    const newInstruction = document.createElement("div");
    newInstruction.setAttribute("id", "instruction");
    newInstruction.setAttribute("class", "instruction-panel");
    const optionOne = document.createElement("h1");
    optionOne.setAttribute("id", "instruction-text");
    optionOne.textContent = "Press spacebar to play again, or";

    const optionTwo = document.createElement("h1");
    optionTwo.setAttribute("id", "option-two");
    optionTwo.textContent = "Add the Airbyte Winter Release to your calendar!";

    const button = document.createElement("button");
    button.setAttribute("id", "calendar-button");
    button.setAttribute("class", "key__button");
    button.textContent = "Add to Calendar";
    button.onclick = () => {
      window.open("https://airbyte.io/winter-release");
    };

    newInstruction.appendChild(optionOne);
    newInstruction.appendChild(optionTwo);
    newInstruction.appendChild(button);
    front!.appendChild(newInstruction);
  };
});
