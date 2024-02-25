/**
 * UI
 */

import { getGlobalHighScores } from "../api/highScores";
import {
  drawGlobalHighScores,
  getLocalHighScore,
  setValueInLocalStorage,
} from "../utils";

export const prepareGameUI = () => {
  document.addEventListener("DOMContentLoaded", async () => {
    const globalHighScores = (await getGlobalHighScores()) as [
      string,
      number
    ][];
    drawGlobalHighScores(globalHighScores);

    setValueInLocalStorage("globalHighScores", globalHighScores);

    const flipButton = document.getElementById("btn-flip");
    const flipContainer = document.querySelector(".flip-container");
    if (flipButton && flipContainer) {
      flipButton.addEventListener("click", () => {
        if (flipContainer.classList.contains("scoreboard")) {
          flipContainer.classList.remove("scoreboard");
          flipButton.innerText = "Leaderboard";
          return;
        }
        flipContainer.classList.add("scoreboard");
        flipButton.innerText = "Play game";
      });
    }

    const pageUrl = window.location.href;
    const shareTwitter = document.getElementById("shareTwitter");
    if (shareTwitter) {
      shareTwitter.addEventListener("click", () => {
        window.open(
          `https://twitter.com/intent/tweet?text=I scored ${getLocalHighScore()} on SnakeByte!&url=${pageUrl}&hashtags=snakebyte,airbyte,winterRelease`,
          "_blank"
        );
      });
    }

    const shareLinkedIn = document.getElementById("shareLinkedIn");
    if (shareLinkedIn) {
      shareLinkedIn.addEventListener("click", () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
          "_blank"
        );
      });
    }
  });

  const muteButton = document.querySelector("#toggle-music");
  if (muteButton?.innerHTML === "") {
    muteButton.innerHTML = "&#128266;";
  }

  const copyUrlButton = document.querySelector("#copy-icon");

  copyUrlButton!.addEventListener("click", function () {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      function () {
        copyUrlButton!.innerHTML = "✅";
      },
      function (err) {
        // Error handling
        console.error("Could not copy URL: ", err);
      }
    );
  });
};

type PopupOptions = {
  onSubmit: (username: string) => void;
  onCancel: () => void;
};

export function createPopup(): [Element, Element] {
  const popupContainer = document.createElement("div");
  popupContainer.className = "popup";
  popupContainer.style.position = "fixed";
  popupContainer.style.top = "0";
  popupContainer.style.left = "0";
  popupContainer.style.width = "100vw";
  popupContainer.style.height = "100vh";
  popupContainer.style.display = "flex";
  popupContainer.style.justifyContent = "center";
  popupContainer.style.alignItems = "center";
  popupContainer.style.backgroundColor = "rgba(0,0,0,0.5)";

  // Create the popup content box
  const popupBox = document.createElement("div");
  popupBox.style.padding = "20px";
  popupBox.style.backgroundColor = "#fff";
  popupBox.style.borderRadius = "5px";
  popupBox.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";

  return [popupContainer, popupBox];
}

export function createUserInputPopup(options: PopupOptions): void {
  const { onSubmit, onCancel } = options;

  const [popupContainer, popupBox] = createPopup();

  // Create the title
  const titleBox = document.createElement("div");
  const titleElement = document.createElement("h2");
  const subTitleElement = document.createElement("p");
  titleElement.textContent = "Congratulations, You earned a new high score!";
  subTitleElement.textContent = "Enter your username and savor the glory!";
  titleBox.appendChild(titleElement);
  titleBox.appendChild(subTitleElement);
  popupBox.appendChild(titleBox);

  // Create the input field
  const inputField = document.createElement("input");
  const inputBox = document.createElement("div");
  inputBox.className = "input-box";
  inputField.type = "text";
  inputField.placeholder = "Enter your username";
  inputField.style.margin = "10px 0";
  inputField.style.width = "100%";
  inputBox.appendChild(inputField);

  const buttonBox = document.createElement("div");
  // Create the submit button
  const submitButton = document.createElement("button");
  submitButton.className = "btn submit";
  submitButton.textContent = "Submit";
  submitButton.onclick = () => {
    onSubmit(inputField.value);
    document.body.removeChild(popupContainer);
  };
  buttonBox.appendChild(submitButton);

  // Create the cancel button
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.className = "btn cancel";
  cancelButton.onclick = () => {
    onCancel();
    document.body.removeChild(popupContainer);
  };
  buttonBox.appendChild(cancelButton);
  inputBox.appendChild(buttonBox);
  // Append the popup box to the container, and the container to the body
  popupBox.appendChild(inputBox);
  popupContainer.appendChild(popupBox);
  document.body.appendChild(popupContainer);
}
