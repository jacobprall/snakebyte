import { Direction } from "../types";
import { SnakeModel } from "./Snake";
import upPath from "../images/up.png";
import downPath from "../images/down.png";
import leftPath from "../images/left.png";
import rightPath from "../images/right.png";

interface RendererModel {
  board: HTMLElement;
  eyesByDirection: { [key: string]: string };
  headShapeByDirection: { [key: string]: string };
  clearBoard: () => void;
  drawSnake: (snake: SnakeModel, direction: Direction) => void;
  // drawConsumables: (consumables: { x: number; y: number; type: string; img: string }[]) => void;
  createGameElement: (
    tag: string,
    className: string,
    img?: string
  ) => HTMLElement;
  setPosition: (
    element: HTMLElement,
    position: { x: number; y: number }
  ) => void;
  updateScore: (scoreElement: HTMLElement, score: number) => void;
}

export class Renderer implements RendererModel {
  board: HTMLElement;
  eyesByDirection: { [key: string]: string };
  headShapeByDirection: { [key: string]: string };

  constructor() {
    this.board =
      document.getElementById("game-board") ?? document.createElement("div");

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

  clearBoard() {
    this.board.innerHTML = "";
  }

  drawSnake(snake: SnakeModel, direction: Direction) {
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
      this.board.appendChild(snakeElement);
    });
  }

  // drawConsumables(consumables) {
  //   consumables.forEach((consumable) => {
  //     const consumableElement = this.createGameElement('div', consumable.type, consumable.img);
  //     this.setPosition(consumableElement, consumable);
  //     this.board.appendChild(consumableElement);
  //   });
  // }

  createGameElement(tag: string, className: string, img = "") {
    const element = document.createElement(tag);
    element.className = `${className} ${img}`;
    return element;
  }

  setPosition(element: HTMLElement, position: { x: number; y: number }) {
    element.style.gridColumn = position.x.toString();
    element.style.gridRow = position.y.toString();
  }

  updateScore(scoreElement: HTMLElement, score: number) {
    scoreElement.textContent = score.toString();
  }
}
