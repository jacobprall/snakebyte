import eat from "../audio/eat.mp3";
import turn from "../audio/turn.mp3";
import dead from "../audio/dead.mp3";
import hit from "../audio/hit.mp3";
import background from "../audio/background-music.mp3";
const sounds = [
  { path: eat, name: "eat" },
  { path: turn, name: "turn" },
  { path: dead, name: "dead" },
  { path: hit, name: "hit" },
  { path: background, name: "background" },
];
export class AudioManager {
  sounds: {
    sound: HTMLAudioElement;
    name: string;
  }[];
  constructor() {
    this.sounds = sounds.map((sound) => {
      const audio = new Audio(sound.path);
      audio.volume = 0.1;
      return { sound: audio, name: sound.name };
    });
  }

  playSound(soundName: string) {
    if (this.sounds.find((sound) => sound.name === soundName)?.sound) {
      this.sounds.find((sound) => sound.name === soundName)?.sound.play();
    }
  }

  playBackground() {
    const background = this.sounds.find((sound) => sound.name === "background")?.sound;
    if (background) {
      background.loop = true;
      background.play();
    }
  }

  stopBackground() {
    const background = this.sounds.find((sound) => sound.name === "background")?.sound;
    if (background) {
      background.pause();
    }
  }

  isBackgroundPlaying() {
    const background = this.sounds.find((sound) => sound.name === "background")?.sound;
    if (background) {
      return !background.paused;
    }
    return false;
  }
}
