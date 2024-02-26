import { Game } from "./Game";

export interface SnakeModel {
  segments: { x: number; y: number }[];
  move: (game: Game) => void;
  grow: () => void;
}

export class Snake implements SnakeModel {
  segments: { x: number; y: number }[];
  constructor(initialPosition: { x: number; y: number }) {
    this.segments = [initialPosition];
  }

  move(game: Game) {
    const head = { ...this.segments[0] };
    switch (game.direction) {
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

    this.segments.unshift(head);
    game.checkCollisionWithConsumables();
    this.segments.pop();
  }

  grow() {
    this.segments.push({ ...this.segments[this.segments.length - 1] });
  }
}
