import { getGlobalHighScores, handleHighScoreSubmit } from "./api/highScores";
import { createUserInputPopup } from "./ui";

export function getValueFromLocalStorage<T>(
  key: string,
  defaultValue: T | null = null
): T | null {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error retrieving key "${key}" from local storage:`, error);
    return defaultValue;
  }
}

export function setValueInLocalStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting key "${key}" in local storage:`, error);
  }
}

export function getLocalHighScore(): number {
  return getValueFromLocalStorage("highScore", 0) ?? 0;
}

export const drawGlobalHighScores = async () => {
  const highScores = (await getGlobalHighScores()) as [string, number][];

  highScores.forEach((item, i) => {
    const listItem = document.getElementById(`score-board-list-item-${i + 1}`);
    if (listItem) {
      const rankDiv = listItem.childNodes[0];
      const usernameDiv = listItem.childNodes[1];
      const scoreDiv = listItem.childNodes[2];

      rankDiv.textContent = `${i + 1}`;
      usernameDiv.textContent = item[0];
      scoreDiv.textContent = `${item[1]}`;
    }
  });
};

export const drawLocalHighScore = () => {
  const highScoreText = document.getElementById("highScore");
  highScoreText!.textContent = getLocalHighScore().toString();
};

export const handleHighScoreSubmitCb = async (
  username: string,
  score: number,
  localScore: number,
) => {
  await handleHighScoreSubmit(username, score, localScore);
  const newGlobalHighScores = await getGlobalHighScores();
  setValueInLocalStorage("globalHighScores", newGlobalHighScores);
  drawGlobalHighScores();
};

export async function updateGlobalHighScore(score: number, localHighScore: number) {
  const globalHighScores = getValueFromLocalStorage("globalHighScores", []) as [
    string,
    number
  ][];
  const globalLowestHighScore = globalHighScores.slice(-1)[0][1];
  if (score > globalLowestHighScore) {
    createUserInputPopup({
      onSubmit: (username: string) => handleHighScoreSubmitCb(username, score, localHighScore),
      onCancel: () => console.log("Popup canceled"),
    });
  }
}

export function updateLocalHighScore(score: number) {
  const highScore = getLocalHighScore();
  if (score > highScore) {
    setValueInLocalStorage("highScore", score);
  }

  const highScoreText = document.getElementById("highScore");

  highScoreText!.textContent = getLocalHighScore().toString();
  return getLocalHighScore();
}

export function createGameElement(
  tag: string,
  className: string,
  img?: string
) {
  const element = document.createElement(tag);
  element.className = className + " " + (img ? img : "");
  return element;
}

export function setPosition(
  element: HTMLElement,
  position: { x: number; y: number }
) {
  element.style.gridColumn = String(position.x);
  element.style.gridRow = String(position.y);
}

export function getCanvasFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillStyle = '#f60';
  ctx!.fillRect(50, 0, 100, 50);
  ctx!.fillStyle = '#069';
  ctx!.fillText('Hello, world!', 2, 15);
  return canvas.toDataURL();
}