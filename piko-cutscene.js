const cutscene = document.querySelector("#piko-cutscene");
const skipButton = document.querySelector("#piko-skip");
const speechBubble = document.querySelector("#piko-speech-bubble");
const speechText = document.querySelector("#piko-speech-text");
const announcement = document.querySelector("#piko-announcement");
const sunshine = document.querySelector("#sunshine");
const firstSection = [
  "I'm Piko, the last signal scout. The blackout has cut every town off from the others. Emergency messages can't get through, and our relay network is broken."
];
const secondSection = [
  "We need to rebuild it, but we're out of parts! Wait, there's some signal here!! Oh, wait, what!? It's a sponsor sending supplies for the rebuild—we got a sponsor!!!"
];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let audioContext;
let humGain;
let humOscillators = [];
let humStarted = false;
let audioResumePending = false;
let audioResumeAttempted = false;
let audioUnavailableWarningShown = false;
let skipRequested = false;
let bubbleSkipRequested = false;
let resolveCurrentPause;
let sceneState = "playing";

function pause(duration, respectReducedMotion = true) {
  if (skipRequested || sceneState !== "playing") return Promise.resolve();
  return new Promise((resolve) => {
    let timer;
    const finish = () => {
      window.clearTimeout(timer);
      if (resolveCurrentPause === finish) resolveCurrentPause = null;
      resolve();
    };
    resolveCurrentPause = finish;
    timer = window.setTimeout(finish, reducedMotion && respectReducedMotion ? 0 : duration);
  });
}

function skipCutscene() {
  if (sceneState !== "playing" || skipRequested) return;
  skipRequested = true;
  resolveCurrentPause?.();
}

function skipCurrentBubble() {
  if (!cutscene.classList.contains("is-speaking") || skipRequested) return;
  bubbleSkipRequested = true;
  resolveCurrentPause?.();
}

speechBubble.addEventListener("click", skipCurrentBubble);
skipButton.addEventListener("click", skipCutscene);
speechBubble.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    skipCurrentBubble();
  }
});

async function resumeAudio(fromInteraction = false) {
  if (audioContext?.state === "running") return true;
  if (
    !audioContext ||
    audioResumePending ||
    (audioResumeAttempted && !fromInteraction)
  ) return false;
  audioResumeAttempted = true;
  audioResumePending = true;
  try {
    await audioContext.resume();
  } catch (error) {
    console.warn("Piko's text blip sound could not start:", error);
    return false;
  } finally {
    audioResumePending = false;
  }
  const isRunning = audioContext.state === "running";
  if (isRunning) audioEnableButton.hidden = true;
  return isRunning;
}

function startBackgroundHum() {
  if (sceneState !== "playing" || humStarted) return;
  const AudioContext = window.AudioContext;
  if (!AudioContext) {
    if (!audioUnavailableWarningShown) {
      audioUnavailableWarningShown = true;
      console.warn("Piko's background hum is unavailable: Web Audio is not supported.");
    }
    return;
  }

  audioContext ??= new AudioContext();
  const filter = audioContext.createBiquadFilter();
  humGain = audioContext.createGain();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(190, audioContext.currentTime);
  humGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  humGain.gain.linearRampToValueAtTime(0.018, audioContext.currentTime + 1.2);
  filter.connect(humGain);
  humGain.connect(audioContext.destination);

  for (const [frequency, level] of [[55, 0.55], [82.4, 0.2]]) {
    const oscillator = audioContext.createOscillator();
    const voiceGain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    voiceGain.gain.setValueAtTime(level, audioContext.currentTime);
    oscillator.connect(voiceGain);
    voiceGain.connect(filter);
    oscillator.start();
    humOscillators.push(oscillator);
  }
  humStarted = true;
  resumeAudio(true);
}

function handleAudioInteraction() {
  startBackgroundHum();
  void resumeAudio(true);
}

function fadeBackgroundHum() {
  if (!humGain || !audioContext) return;
  const now = audioContext.currentTime;
  humGain.gain.cancelScheduledValues(now);
  humGain.gain.setValueAtTime(humGain.gain.value, now);
  humGain.gain.linearRampToValueAtTime(0.0001, now + 1);
  for (const oscillator of humOscillators) oscillator.stop(now + 1.1);
  humOscillators = [];
}

window.addEventListener("pointerdown", handleAudioInteraction);
window.addEventListener("keydown", (event) => {
  handleAudioInteraction();
  if (event.key.toLowerCase() !== "x" || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && (
    event.target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
  )) return;
  event.preventDefault();
  skipCutscene();
});

function playTextBlip(characterIndex) {
  const AudioContext = window.AudioContext;
  if (!AudioContext && !audioUnavailableWarningShown) {
    audioUnavailableWarningShown = true;
    console.warn("Piko's text blip sound is unavailable: Web Audio is not supported.");
  }
  if (!AudioContext) return;

  audioContext ??= new AudioContext();
  if (audioContext.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(characterIndex % 2 === 0 ? 1050 : 830, now);
  oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.035);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.075, now + 0.004);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.045);
}

async function speak(message) {
  bubbleSkipRequested = false;
  cutscene.classList.add("is-speaking");
  announcement.textContent = message;

  if (reducedMotion) {
    if (!bubbleSkipRequested) speechText.textContent = message;
  } else {
    for (const [index, character] of [...message].entries()) {
      if (skipRequested) return false;
      if (bubbleSkipRequested) break;
      speechText.textContent += character;
      if (character !== " ") playTextBlip(index);
      await pause(28);
      if (skipRequested) return false;
      if (bubbleSkipRequested) break;
    }
  }

  if (!bubbleSkipRequested) {
    const readingTime = reducedMotion ? Math.min(7000, 1800 + message.length * 38) : 1400;
    await pause(readingTime, false);
  }
  if (skipRequested) return false;
  cutscene.classList.add("is-bubble-leaving");
  await pause(380);
  if (skipRequested) return false;
  cutscene.classList.remove("is-speaking", "is-bubble-leaving");
  speechText.textContent = "";
  bubbleSkipRequested = false;
  await pause(240);
  return !skipRequested;
}

async function playCutscene() {
  startBackgroundHum();
  await pause(900);
  if (skipRequested) return skipToGlitchEnding();
  skipButton.hidden = false;
  cutscene.hidden = false;
  cutscene.classList.add("is-entering", "is-glitching");

  await pause(1150);
  if (skipRequested) return skipToGlitchEnding();
  cutscene.classList.remove("is-entering");
  cutscene.classList.add("is-arrived");

  await pause(700);
  if (skipRequested) return skipToGlitchEnding();
  cutscene.classList.remove("is-glitching");
  cutscene.classList.add("is-buzzing");

  await pause(780);
  if (skipRequested) return skipToGlitchEnding();
  cutscene.classList.remove("is-buzzing");

  await pause(1200);
  if (skipRequested) return skipToGlitchEnding();
  for (const line of firstSection) {
    if (!(await speak(line))) return skipToGlitchEnding();
  }

  cutscene.classList.add("is-moving-left");
  cutscene.classList.add("is-on-left");
  await pause(reducedMotion ? 0 : 1150);
  cutscene.classList.remove("is-moving-left");
  if (skipRequested) return skipToGlitchEnding();
  for (const line of secondSection) {
    if (!(await speak(line))) return skipToGlitchEnding();
  }

  await pause(700);
  if (skipRequested) return skipToGlitchEnding();
  cutscene.classList.remove("is-speaking");
  cutscene.classList.add("is-glitching-out");

  await pause(800);
  finishCutscene();
}

async function finishCutscene() {
  sceneState = "sun";
  fadeBackgroundHum();
  cutscene.hidden = true;
  cutscene.classList.remove("is-entering", "is-arrived", "is-glitching", "is-buzzing", "is-speaking", "is-bubble-leaving", "is-glitching-out", "is-moving-left", "is-on-left");

  sunshine.hidden = false;
  sunshine.classList.remove("is-permanent");
  sunshine.classList.add("is-shining");
  await new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 0 : 2800));
  if (sceneState === "dismissed") return;
  sunshine.classList.remove("is-shining");
  sunshine.classList.add("is-permanent");
  sunshine.hidden = false;
  sceneState = "complete";
  skipButton.hidden = true;
}

async function skipToGlitchEnding() {
  sceneState = "ending";
  skipRequested = false;
  skipButton.hidden = true;
  cutscene.hidden = false;
  cutscene.classList.remove("is-entering", "is-glitching", "is-buzzing", "is-speaking", "is-bubble-leaving", "is-moving-left");
  cutscene.classList.add("is-arrived", "is-glitching-out");
  await new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 0 : 800));
  await finishCutscene();
}

function playCutsceneOnce() {
  const cutsceneSeenKey = "lost-signal-piko-cutscene-seen";
  try {
    if (window.localStorage.getItem(cutsceneSeenKey) === "true") {
      sunshine.hidden = false;
      sunshine.classList.add("is-permanent");
      sceneState = "complete";
      return;
    }
    window.localStorage.setItem(cutsceneSeenKey, "true");
  } catch (error) {
    console.warn("Unable to save Piko cutscene state; it may play again on a later visit.", error);
  }
  playCutscene();
}

window.addEventListener("load", playCutsceneOnce, { once: true });
