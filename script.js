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

const guideEntities = [];

// const guideGeometry =
//   potentialGeometries[getRandomInt(0, potentialGeometries.length)];

// const guideColor = "blue";

updateGuideEntities({
  geometry: potentialGeometries[getRandomInt(0, potentialGeometries.length)],
  color: "blue",
});

// just for testing purposes
setTimeout(() => {
  updateGuideEntities({
    geometry: potentialGeometries[getRandomInt(0, potentialGeometries.length)],
    color: "red",
  });
}, 5000);

function run() {
  // for (let i = -1; i < 2; i++)
  //   createRandomEntity({ x: 0 + 3 * i, y: 0, z: -10 });

  // const distance = 10;

  // for (let deg = 0; deg < 360; deg += 20) {
  //   const rad = deg * (Math.PI / 180);
  //   const x = Math.cos(rad) * distance;
  //   const y = 0;
  //   const z = Math.sin(rad) * distance;
  //   createRandomEntity({ x, y, z });
  //   console.log(deg);
  // }

  addEntitiesInCircle(createRandomEntity, {
    degreeIncrement: 20,
    distance: 12,
    y: 0,
  });

  addEntitiesInCircle(createGuideEntity, {
    degreeIncrement: 90,
    distance: 16,
    y: 5,
  });

  console.log("Loaded");
}

function createRandomEntity(position) {
  const randomGeometry =
    potentialGeometries[getRandomInt(0, potentialGeometries.length)];

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

function createGuideEntity(position) {
  const newEntity = document.createElement("a-entity");
  updateGuideEntityFromVars(newEntity);
  // newEntity.setAttribute("geometry", "primitive", toCamelCase(guideGeometry));
  // newEntity.setAttribute("material", "color", guideColor);
  // newEntity.setAttribute("color", guideColor);
  newEntity.setAttribute("position", position);
  scene.appendChild(newEntity);
  guideEntities.push(newEntity);
}

function addEntitiesInCircle(callback, options = {}) {
  const degreeIncrement = options.degreeIncrement ?? 20;
  const distance = options.distance ?? 10;
  const y = options.y ?? 0;

  for (let deg = 0; deg < 360; deg += degreeIncrement) {
    const rad = deg * (Math.PI / 180);
    const x = Math.cos(rad) * distance;
    const z = Math.sin(rad) * distance;
    callback({ x, y, z });
  }
}

function updateGuideEntities(options = {}) {
  guideGeometry = options.geometry;
  guideColor = options.color;

  for (const guideEntity of guideEntities)
    updateGuideEntityFromVars(guideEntity);
}

function updateGuideEntityFromVars(guideEntity) {
  guideEntity.setAttribute("geometry", "primitive", toCamelCase(guideGeometry));
  guideEntity.setAttribute("material", "color", guideColor);
}

function toCamelCase(geometry) {
  return geometry
    .split("-")
    .map((word, i) =>
      i === 0 ? word : word.substring(0, 1).toUpperCase() + word.substring(1)
    )
    .join("");
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
