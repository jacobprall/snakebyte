import { Direction } from "../types";
import { SnakeModel } from "./Snake";
import upPath from "../images/up.png";
import downPath from "../images/down.png";
import leftPath from "../images/left.png";
import rightPath from "../images/right.png";
import { Consumables } from "./Consumables";
import { Game } from "./Game";

interface RendererModel {
  board: HTMLElement;
  eyesByDirection: { [key: string]: string };
  headShapeByDirection: { [key: string]: string };
  clearBoard: () => void;
  drawSnake: (snake: SnakeModel, direction: Direction) => void;
  drawConsumables: (consumables: Consumables[]) => void;
  createGameElement: (
    tag: string,
    className: string,
    img?: string
  ) => HTMLElement;
  setPosition: (
    element: HTMLElement,
    position: { x: number; y: number }
  ) => void;
  updateScore: (score: number) => void;
}

export class Renderer implements RendererModel {
  board: HTMLElement;
  eyesByDirection: { [key: string]: string };
  headShapeByDirection: { [key: string]: string };

  constructor(board: HTMLElement) {
    this.board = board;

    this.eyesByDirection = {
      up: upPath,
      down: downPath,
      left: leftPath,
      right: rightPath,
    };

    this.headShapeByDirection = {
      up: "3px 3px 0 0",
      down: "0 0 3px 3px",
      left: "3px 0 0 3px",
      right: "0 3px 3px 0",
      start: "3px 3px 3px 3px",
    };
  }

  draw(game: Game) {
    this.clearBoard();
    this.drawSnake(game.snake, game.direction);
    this.drawConsumables(game.consumables);
    this.updateScore(game.snake.segments.length - 1);
  }

  clearBoard() {
    const board = document.getElementById("game-board");
    if (board) {
      board!.innerHTML = "";
    }
  }

  drawSnake(snake: SnakeModel, direction: Direction) {
    const board = document.getElementById("game-board");
    snake.segments.forEach((segment, index) => {
      const snakeElement = this.createGameElement("div", "snake");
      this.setPosition(snakeElement, segment);
      if (index === 0) {
        snakeElement.style.backgroundImage = `url(${this.eyesByDirection[direction]})`;
        snakeElement.style.backgroundSize = "cover";
        snakeElement.style.borderRadius = this.headShapeByDirection[direction];
      }
      if (snake.segments.length === 1) {
        snakeElement.style.borderRadius = this.headShapeByDirection["start"];
      }
      board!.appendChild(snakeElement);
    });
  }

  drawConsumables(consumables: Consumables[]) {
    const board = document.getElementById("game-board");

    consumables.forEach((consumable) => {
      const consumableElement = this.createGameElement(
        "div",
        consumable.type,
        consumable.img
      );
      this.setPosition(consumableElement, consumable);
      board!.appendChild(consumableElement);
    });
  }

  createGameElement(tag: string, className: string, img = "") {
    const element = document.createElement(tag);
    element.className = `${className} ${img}`;
    return element;
  }

  setPosition(element: HTMLElement, position: { x: number; y: number }) {
    element.style.gridColumn = position.x.toString();
    element.style.gridRow = position.y.toString();
  }

  updateScore(score: number) {
    const scoreDom = document.getElementById("score");
    scoreDom!.textContent = score.toString();
  }
}
