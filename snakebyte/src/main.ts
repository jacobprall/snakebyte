import "./style.css";
import { prepareGameUI } from "./ui";

prepareGameUI();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `

  <body>
    <div id="wrapper">
      <div>
        <h1 id="welcome">Welcome to SnakeByte!</h1>
        <p id="welcome-subheader">Play to reveal Livestream Event Link!</p>

      </div>
      <div class="scores">
        <h1 class="score" id="score">000</h1>
        <div style="display: flex; align-items: center">
          <p style="margin-right: 12px; color: white">Your Best:</p>
          <h1 class="score" id="highScore">000</h1>
        </div>
      </div>
      <div class="flip-container">
        <div class="flipper">
          <div class="front">
            <div class="game-border-1">
              <div class="game-border-2">
                <div class="game-border-3">
                  <div id="game-board">
                    <div id="instruction">
                      <h1 id="instruction-text">
                        Press spacebar to start the game
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="back">
            <div id="score-board">
              <h1 id="score-board-text">High Scores</h1>
              <div id="score-board-list">
                <div
                  id="score-board-list-item-1"
                  class="score-board-item"
                ></div>
                <div
                  id="score-board-list-item-2"
                  class="score-board-item"
                ></div>
                <div
                  id="score-board-list-item-3"
                  class="score-board-item"
                ></div>
                <div
                  id="score-board-list-item-4"
                  class="score-board-item"
                ></div>
                <div
                  id="score-board-list-item-5"
                  class="score-board-item"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div>
          <button id="btn-flip" class="btn flip">See the leaderboard</button>
          <button id="toggle-music" class="btn flip">
            <!-- mute button -->
            Toggle Music
          </button>
        </div>
        <div id="socialShare">
          <button class="btn-social" id="shareTwitter">
            <img src="https://img.icons8.com/color/48/000000/twitter--v1.png" />
          </button>
          <button class="btn-social" id="shareLinkedIn">
            <img src="https://img.icons8.com/color/48/000000/linkedin.png" />
          </button>
        </div>
      </div>
    </div>
`;
