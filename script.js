const scene = document.querySelector("a-scene");

if (scene.hasLoaded) run();
else scene.addEventListener("loaded", run);

function run() {
  console.log("Loaded");
}
