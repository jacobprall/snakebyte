import { postPlay } from "../api/metrics";
import { Direction } from "../types";
import { toggleInstructions } from "../ui";
import {
  drawLocalHighScore,
  getCanvasFingerprint,
  updateGlobalHighScore,
  updateLocalHighScore,
} from "../utils";
import { AudioManager } from "./AudioManager";
import { Consumable, Consumables } from "./Consumables";
import { InputManager } from "./InputManager";
import { Renderer } from "./Renderer";
import { Snake } from "./Snake";

interface GameModel {
  snake: Snake;
  consumables: Consumables[];
  gameInterval: any;
  gameSpeedDelay: number;
  gameStarted: boolean;
  renderer: Renderer;
  gridSize: number;
  direction: Direction;
  changeSpeed: () => void;
  reset: () => void;
  addConsumable: (consumable: Consumables) => void;
  getClearPosition: () => { x: number; y: number };
  start: () => void;
  stop: () => void;
  updateScore: () => void;
}

export class Game implements GameModel {
  snake: Snake;
  consumables: Consumables[];
  gameInterval: any;
  gameSpeedDelay: number;
  gameStarted: boolean;
  renderer: Renderer;
  gridSize: number;
  direction: Direction = "right";
  inputManager: InputManager;
  audioManager: AudioManager;

  constructor() {
    const board = document.getElementById("game-board") as HTMLDivElement;
    const renderer = new Renderer(board);
    this.renderer = renderer;
    this.renderer.clearBoard();
    this.snake = new Snake({ x: 10, y: 10 });
    this.consumables = [];
    this.gameInterval = null;

    this.gameStarted = false;
    const inputManager = new InputManager();
    this.gridSize = inputManager.isMobile() ? 15 : 20;
    this.gameSpeedDelay = inputManager.isMobile() ? 250 : 200;
    this.inputManager = inputManager;
    this.audioManager = new AudioManager();
  }

  initControls() {
    this.inputManager.initStartControls(this);
    this.inputManager.initTouchControls(this);
    this.inputManager.initHandleKeyPress(this);
  }

  initMusicToggle() {
    const muteButton = document.getElementById("toggle-music");
    const textIcon = document.getElementById("text-icon");

    muteButton!.addEventListener("click", () => {
      if (this.audioManager.isBackgroundPlaying()) {
        // play audio emoji
        textIcon!.innerHTML = "⏹️";

        this.audioManager.stopBackground();
      } else {
        textIcon!.innerHTML = "🔊";
        this.audioManager.playBackground();
      }
    });
  }

  changeSpeed() {
    if (this.gameSpeedDelay > 150) {
      this.gameSpeedDelay -= 5;
    } else if (this.gameSpeedDelay > 100) {
      this.gameSpeedDelay -= 3;
    } else if (this.gameSpeedDelay > 50) {
      this.gameSpeedDelay -= 2;
    } else if (this.gameSpeedDelay > 25) {
      this.gameSpeedDelay -= 1;
    }
    clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => {
      this.snake.move(this);
      this.renderer.clearBoard();
      this.renderer.drawSnake(this.snake, this.direction);
      this.renderer.drawConsumables(this.consumables);
    }, this.gameSpeedDelay);
  }

  addConsumable(consumable: Consumables) {
    this.consumables.push(consumable);
    this.renderer.drawConsumables(this.consumables);
  }

  getClearPosition() {
    const occupiedPositions = this.snake.segments
      .map((segment) => `${segment.x}-${segment.y}`)
      .concat(
        this.consumables.map((consumable) => `${consumable.x}-${consumable.y}`)
      );
    let x = Math.floor(Math.random() * this.gridSize) + 1;
    let y = Math.floor(Math.random() * this.gridSize) + 1;

    while (occupiedPositions.includes(`${x}-${y}`)) {
      x = Math.floor(Math.random() * this.gridSize) + 1;
      y = Math.floor(Math.random() * this.gridSize) + 1;
    }

    return { x, y };
  }

  setDirection(direction: Direction) {
    this.direction = direction;
  }

  loop() {
    this.snake.move(game);
    this.checkCollision();
    this.renderer.draw(this);
  }

  start() {
    this.gameStarted = true;
    this.audioManager.playBackground();
    drawLocalHighScore();
    const fp = getCanvasFingerprint();
    postPlay(fp);
    toggleInstructions(true);
    this.addConsumable(
      new Consumable(this.getClearPosition().x, this.getClearPosition().y)
    );
    clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => {
      this.loop();
    }, this.gameSpeedDelay);
  }

  stop() {
    const score = this.snake.segments.length;
    const localHighScore = updateLocalHighScore(score);
    clearInterval(this.gameInterval);
    this.gameStarted = false;
    updateGlobalHighScore(score, localHighScore);
    this.gameStarted = false;
    toggleInstructions();
    this.inputManager.initTouchControls(this);
  }

  isGameStarted() {
    return this.gameStarted;
  }

  reset() {
    this.stop();
    this.snake = new Snake({ x: 10, y: 10 });
    this.consumables = [];
    this.setDirection("right");
    this.gameSpeedDelay = this.inputManager.isMobile() ? 250 : 200;
  }

  updateScore() {
    const score = document.getElementById("score");
    score!.textContent = this.snake.segments.length.toString();
  }

  checkCollisionWithConsumables() {
    const head = this.snake.segments[0];
    this.consumables.forEach((consumable, index) => {
      if (head.x === consumable.x && head.y === consumable.y) {
        consumable.applyEffect(this);
        this.consumables.splice(index, 1);
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => {
          this.loop();
        }, this.gameSpeedDelay);
      }
    });
  }

  checkCollision() {
    const head = this.snake.segments[0] ?? { x: -1, y: -1 };
    if (
      head.x < 1 ||
      head.x > this.gridSize ||
      head.y < 1 ||
      head.y > this.gridSize
    ) {
      this.audioManager.playSound("dead");
      this.reset();
    }

    for (let i = 1; i < this.snake.segments.length; i++) {
      if (
        head.x === this.snake.segments[i].x &&
        head.y === this.snake.segments[i].y
      ) {
        this.audioManager.playSound("dead");
        this.reset();
      }
    }
  }
}
export const game = new Game();
