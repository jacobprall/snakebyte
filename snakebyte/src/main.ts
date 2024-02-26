import "./style.css";
import { prepareGameUI } from "./ui";
import { game } from "./models/Game";
import { postPageView } from "./api/metrics";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `

  <body>
    <div id="wrapper">
      <div id="header">
        <h1 id="welcome">Welcome to SnakeByte!</h1>
        <a style="color: white;" href="https://github.com/airbytehq/PyAirbyte" target="_blank">A PyAirbyte Game</a>
        <p>Gobble up the sources and destinations to grow. Avoid the pesky bugs!</p>
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
          <div id="front">
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
          <div class="game-border-1">
          <div class="game-border-2">
            <div class="game-border-3">
            <div id="score-board">
              <h1 id="score-board-text">LEADERBOARD</h1>
              <table id="score-board-list">
              <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              </tr>
              <tr id="score-board-list-item-1">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-2">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-3">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-4">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr  id="score-board-list-item-5" >
                <td class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-6">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-7">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-8">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-9">
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
              <tr id="score-board-list-item-10">
                <td class="score-board-item"></td>
                <td  class="score-board-item"></td>
                <td  class="score-board-item"></td>
              </tr>
            </table>
            </div>
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="btn-group">
          <button id="btn-flip" class="key__button">Leaderboard</button>
          <button id="toggle-music" class="key__button btn-social">
          <div id="text-icon">
            ⏹️
          </div>
          </button>
        </div>
        <div class="btn-group">
          <button class="btn-social key__button" id="shareTwitter">
            <img src="https://img.icons8.com/color/48/000000/twitter--v1.png" />
          </button>
          <button class="btn-social key__button" id="shareLinkedIn">
            <img src="https://img.icons8.com/color/48/000000/linkedin.png" />
          </button>
          <button class="btn-social key__button" id="copyUrlButton">
            <div id="copy-icon">
             🔗
           </div>
          </button>
        </div>
      </div>
    </div>
`;

document.addEventListener("DOMContentLoaded", async () => {
  await prepareGameUI();
  game.initControls();
  game.initMusicToggle();
  await postPageView();
});
