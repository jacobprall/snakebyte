import { Direction } from "../types";

interface InputManagerModel {
  board: HTMLDivElement;
  initTouchControls: (game: any) => void;
  initStartControls: (game: any) => void;
  initHandleKeyPress: () => void;
  isMobile: () => boolean;
  getTouchDirection: (event: TouchEvent, direction: Direction) => Direction;
}

export class InputManager implements InputManagerModel {
  board: HTMLDivElement;
  mobileX: number | null = null;
  mobileY: number | null = null;
  direction: Direction;

  constructor(game: any) {
    this.initTouchControls(game);
    this.initStartControls(game);
    this.initHandleKeyPress();
    this.board = document.getElementById("game-board") as HTMLDivElement;
    this.direction = "right";
  }
  initHandleKeyPress() {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          // audioManager.play();
          this.direction = "up";
          break;
        case "ArrowDown":
          event.preventDefault();
          // audioTurn.play();
          this.direction = "down";
          break;
        case "ArrowLeft":
          event.preventDefault();
          // audioTurn.play();
          this.direction = "left";
          break;
        case "ArrowRight":
          event.preventDefault();
          // audioTurn.play();
          this.direction = "right";
          break;
      }
    };
    document.addEventListener("keydown", handleKeyPress);
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

  getTouchDirection(event: TouchEvent, direction: Direction): Direction {
    event.preventDefault();
    if (!this.mobileX || !this.mobileY) return direction; // check swipe
    // if (!gameStarted) return false;
    let newDirection;
    let x2 = event.touches[0].clientX;
    let y2 = event.touches[0].clientY;

    let xDiff = x2 - this.mobileX;
    let yDiff = y2 - this.mobileY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      // swipe left or right
      xDiff > 0 ? (newDirection = "right") : (newDirection = "left");
    } else {
      event.preventDefault();
      // swipe up or down
      yDiff < 0 ? (newDirection = "up") : (newDirection = "down");
    }
    return (newDirection as Direction) ?? direction;
  }

  initTouchControls(game: any) {
    if (this.isMobile()) {
      const startTouchControls = (event: TouchEvent) => {
        const firstTouch = event.touches[0];
        this.mobileX = firstTouch.clientX;
        this.mobileY = firstTouch.clientY;
      };

      this.board?.addEventListener("touchstart", startTouchControls);
      if (!game.started()) {
        game.start();
      }
    }
  }

  initStartControls(game: any) {
    const handleStartPress = (event: KeyboardEvent) => {
      if (
        (!game.started() && event.code === "Space") ||
        (!game.started() && event.key === " ")
      ) {
        event.preventDefault();
        game.start();
      }
    };
    document.addEventListener("keydown", handleStartPress);
  }
}
