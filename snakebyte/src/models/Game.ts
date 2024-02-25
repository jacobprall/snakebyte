import { Direction } from "../types";
import { Renderer } from "./Renderer";
import { Snake } from "./Snake";

const gridSize = isMobile.any() ? 15 : 20;
let snake = new Snake({ x: 10, y: 10 });
let consumables: Consumables[] = [];
let direction: "right" | "left" | "up" | "down" = "right";
let gameInterval: any;
let gameSpeedDelay = 200;
let gameStarted = false;

interface GameModel {
  init: () => void;

}

export class Game implements GameModel{
  snake: Snake;
  consumables: Consumables[];
  gameInterval: any;
  gameSpeedDelay: number;
  gameStarted: boolean;
  renderer: Renderer;


  constructor() {
    const renderer = new Renderer();
    this.renderer = renderer;
    this.renderer.clearBoard();
    this.snake = new Snake({ x: 10, y: 10 });
    this.consumables = [];
    this.gameInterval = null;
    this.gameSpeedDelay = 200;
    this.gameStarted = false;
  }

  

}