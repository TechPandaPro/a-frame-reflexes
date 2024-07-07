const scene = document.querySelector("a-scene");

const potentialGeometries = [
  "box",
  "cone",
  "cylinder",
  "dodecahedron",
  "octahedron",
  "icosahedron",
  "sphere",
  "tetrahedron",
  "torus",
  "torus-knot",
];

if (scene.hasLoaded) run();
else scene.addEventListener("loaded", run);

function run() {
  for (let i = -1; i < 2; i++)
    createRandomEntity({ x: 0 + 3 * i, y: 0, z: -10 });
  console.log("Loaded");
}

function createRandomEntity(position) {
  const randomGeometry =
    potentialGeometries[getRandomInt(0, potentialGeometries.length)];

  console.log(randomGeometry);

  const newEntityColorR = getRandomIntInclusive(0, 255);
  const newEntityColorG = getRandomIntInclusive(0, 255);
  const newEntityColorB = getRandomIntInclusive(0, 255);
  const newEntityColor = `rgb(${newEntityColorR}, ${newEntityColorG}, ${newEntityColorB})`;

  const newEntity = document.createElement(`a-${randomGeometry}`);
  newEntity.setAttribute("color", newEntityColor);
  newEntity.setAttribute("position", position);
  scene.appendChild(newEntity);

  newEntity.addEventListener("click", () => {
    console.log("clicked!");
  });
}

// min is inclusive and max is exclusive
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

// min is inclusive and max is exclusive
function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
