import { AudioManager } from "./AudioManager";
import { Game } from "./Game";
import { Snake } from "./Snake";

export interface Consumables {
  applyEffect: (game: Game) => void;
  type: "source" | "bug";
  x: number;
  y: number;
  img?: string;
  audioManager: AudioManager;
}

const images = [
  "hubspot",
  "github",
  "salesforce",
  "slack",
  "bigquery",
  "s3",
  "snowflake",
  "redshift",
];

export class Consumable implements Consumables {
  type: "source" = "source";
  x: number;
  y: number;
  img: string;
  audioManager = new AudioManager();

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.img = images[Math.floor(Math.random() * images.length)];
  }
  applyEffect(game: Game) {
    this.audioManager.playSound("turn");
    game.snake.grow();
    game.changeSpeed();
    game.updateScore();
    const { x, y } = game.getClearPosition(); // Clear past interval
    game.addConsumable(new Consumable(x, y));
    // 30% chance of adding a new consumable
    const random = Math.floor(Math.random() * 3);
    if (random === 0) {
      game.addConsumable(Consumable.generateRandomConsumable(game));
    }
  }

  static generateRandomConsumable(game: Game) {
    const random = Math.floor(Math.random() * 2);
    const type = ["source", "bug"][random] as "source" | "bug";
    return Consumable.generateConsumable(type, game);
  }

  static generateConsumable(type: "source" | "bug", game: Game) {
    const { x, y } = game.getClearPosition();
    if (type === "bug") {
      const bugConsumable = new Bug(x, y);
      return bugConsumable;
    }
    const sourceConsumable = new Consumable(x, y);
    return sourceConsumable;
  }
}

export class Bug implements Consumables {
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
  applyEffect(game: Game) {
    game.audioManager.playSound("dead");
    game.reset();
  }
}
