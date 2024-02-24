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
    window.localStorage

    .setItem
    (key, JSON.stringify(value));
  }
  catch (error) {
    console.error(`Error setting key "${key}" in local storage:`, error);
  }
}

export function getLocalHighScore(): number {
  return getValueFromLocalStorage("highScore", 0) ?? 0;
}

export const drawGlobalHighScores = (highScores: [string, number][]) => {
  highScores.forEach((item, i) => {
    const listItem = document.getElementById(`score-board-list-item-${i + 1}`);
    if (listItem) {
      listItem.textContent = `${item[0]} - ${item[1]}`;
    }
  });
};