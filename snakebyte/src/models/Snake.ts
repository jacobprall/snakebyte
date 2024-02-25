export interface SnakeModel {
  segments: { x: number; y: number }[];
  move: (direction: "up" | "down" | "left" | "right") => void;
  grow: () => void;
}

export class Snake implements SnakeModel {
  segments: { x: number; y: number }[];
  constructor(initialPosition: { x: number; y: number }) {
    this.segments = [initialPosition];
  }

  move(direction: "up" | "down" | "left" | "right") {
    // Snake movement logic...
  }

  grow() {
    this.segments.push({ ...this.segments[this.segments.length - 1] })
  }
}