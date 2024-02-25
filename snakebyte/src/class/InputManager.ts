import { Direction } from "../types";
import { Game } from "./Game";

interface InputManagerModel {
  initTouchControls: (game: any) => void;
  initStartControls: (game: any) => void;
  initHandleKeyPress: (game: any) => void;
  isMobile: () => boolean;
  getTouchDirection: (game: Game) => void;
}

export class InputManager implements InputManagerModel {
  mobileX: number | null = null;
  mobileY: number | null = null;

  constructor() {}

  initHandleKeyPress(game: any) {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          game.setDirection("up");
          break;
        case "ArrowDown":
          event.preventDefault();
          game.setDirection("down");
          break;
        case "ArrowLeft":
          event.preventDefault();
          game.setDirection("left");
          break;
        case "ArrowRight":
          event.preventDefault();
          game.setDirection("right");
          break;
      }
    };
    document.addEventListener("keydown", handleKeyPress);
  }

  initTouchControls(game: Game) {
    const board = document.getElementById("game-board");
    const startTouchControls = (event: TouchEvent) => {
      const touchStart = event.touches[0];
      this.mobileX = touchStart.clientX;
      this.mobileY = touchStart.clientY;
      game.start();
    };
    this.getTouchDirection(game);

    board?.addEventListener("touchstart", startTouchControls);
  }

  initStartControls(game: Game) {
    const handleStartPress = (event: KeyboardEvent) => {
      if (
        (!game.gameStarted && event.code === "Space") ||
        (!game.gameStarted && event.key === " ")
      ) {
        event.preventDefault();
        game.start();
      }
    };
    document.addEventListener("keydown", handleStartPress);
  }

  isMobile() {
    const isMobileCheck = [
      function () {
        return navigator.userAgent.match(/Android/i);
      },
      function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      function () {
        return navigator.userAgent.match(/IEMobile/i);
      },
    ];

    return isMobileCheck.some((check) => check());
  }

  getTouchDirection(game: Game) {
    const board = document.getElementById("game-board");

    const handleTouch = (event: TouchEvent) => {
      let newDirection;
      let x2 = event.touches[0].clientX;
      let y2 = event.touches[0].clientY;

      let xDiff = x2 - this.mobileX ?? 0;
      let yDiff = y2 - this.mobileY ?? 0;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // swipe left or right
        xDiff > 0 ? (newDirection = "right") : (newDirection = "left");
      } else {
        // swipe up or down
        yDiff < 0 ? (newDirection = "up") : (newDirection = "down");
      }
      console.log({ newDirection });
      event.preventDefault();
      game.setDirection(newDirection as Direction);
    };
    board?.addEventListener("touchend", handleTouch);
  }
}
