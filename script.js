// TODO: prevent duplicate shapes/colors (need to compute distance between colors for this) (done)
// TODO: make guide entities float
// TODO: register when correct shape/color is clicked, and then regenerate the guide entity
// TODO: add directions maybe?

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

let guideGeometry;
let guideColorR;
let guideColorG;
let guideColorB;
let guideColor;

const guideEntities = [];

const existingEntities = [];

// updateGuideEntities({
//   geometry: potentialGeometries[getRandomInt(0, potentialGeometries.length)],
//   color: { r: 0, g: 0, b: 255 },
// });

// // just for testing purposes
// setTimeout(() => {
//   updateGuideEntities({
//     geometry: potentialGeometries[getRandomInt(0, potentialGeometries.length)],
//     color: { r: 255, g: 0, b: 0 },
//   });
// }, 5000);

function run() {
  addEntitiesInCircle(createRandomEntity, {
    degreeIncrement: 20,
    distance: 12,
    y: 0,
  });

  updateGuideEntities(generateNextGuideEntityData());

  addEntitiesInCircle(createGuideEntity, {
    degreeIncrement: 90,
    distance: 16,
    y: 5,
  });

  console.log("Loaded");
}

function createRandomEntity(position) {
  let generateNew = true;

  while (generateNew) {
    const newEntityGeometry =
      potentialGeometries[getRandomInt(0, potentialGeometries.length)];

    const newEntityColorR = getRandomIntInclusive(0, 255);
    const newEntityColorG = getRandomIntInclusive(0, 255);
    const newEntityColorB = getRandomIntInclusive(0, 255);
    const newEntityColor = `rgb(${newEntityColorR}, ${newEntityColorG}, ${newEntityColorB})`;

    if (
      compareColors(
        newEntityColorR,
        newEntityColorG,
        newEntityColorB,
        10,
        10,
        10
      ) < 0.1 &&
      existingEntities.find(
        (entity) =>
          entity.geometry === newEntityGeometry &&
          compareColors(
            newEntityColorR,
            newEntityColorG,
            newEntityColorB,
            entity.color.r,
            entity.color.b,
            entity.color.g
          ) < 0.4
      )
    )
      continue;
    else generateNew = false;

    const newEntity = document.createElement(`a-${newEntityGeometry}`);
    newEntity.setAttribute("color", newEntityColor);
    newEntity.setAttribute("position", position);
    scene.appendChild(newEntity);

    existingEntities.push({
      // entity: newEntity,
      color: { r: newEntityColorR, g: newEntityColorG, b: newEntityColorB },
      geometry: newEntityGeometry,
    });

    newEntity.addEventListener("click", () => {
      if (
        newEntityGeometry === guideGeometry &&
        newEntityColorR === guideColorR &&
        newEntityColorG === guideColorG &&
        newEntityColorB === guideColorB
      ) {
        // updateGuideEntities({
        //   geometry:
        //     potentialGeometries[getRandomInt(0, potentialGeometries.length)],
        //   color: { r: 255, g: 0, b: 0 },
        // });
        updateGuideEntities(generateNextGuideEntityData());
      } else {
        alert("nope!");
      }

      console.log("clicked!");
    });
  }
}

function createGuideEntity(position) {
  const newEntity = document.createElement("a-entity");
  newEntity.setAttribute("position", position);
  // animation="property: position; to: 1 8 -10; dur: 2000; easing: linear; loop: true" color="tomato"
  // newEntity.setAttribute("animation", {
  //   property: "position",
  //   to: { x: 1, y: 8, z: -10 },
  //   dur: 2000,
  //   easing: "linear",
  //   loop: true,
  //   color: "tomato",
  // });
  newEntity.setAttribute("animation", {
    property: "position",
    to: { x: 1, y: 8, z: -10 },
    dir: "alternate",
    dur: 2000,
    easing: "easeInOutQuad",
    loop: true,
    color: "tomato",
  });
  updateGuideEntityFromVars(newEntity);
  scene.appendChild(newEntity);
  guideEntities.push(newEntity);
}

function generateNextGuideEntityData() {
  const randomEntity =
    existingEntities[getRandomInt(0, existingEntities.length)];
  return JSON.parse(JSON.stringify(randomEntity));
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

  guideColorR = options.color.r;
  guideColorG = options.color.g;
  guideColorB = options.color.b;
  guideColor = `rgb(${guideColorR}, ${guideColorG}, ${guideColorB})`;

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

// returns a value from 0 to 1 (closer to 0 means they're closer to each other, 1 means they're farther apart)
function compareColors(r1, g1, b1, r2, g2, b2) {
  let distance;

  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;

  const avgR = (1 / 2) * (r1 + r2);

  if (avgR < 128)
    distance = Math.sqrt(
      2 * Math.pow(r, 2) + 4 * Math.pow(g, 2) + 3 * Math.pow(b, 2)
    );
  else
    distance = Math.sqrt(
      3 * Math.pow(r, 2) + 4 * Math.pow(g, 2) + 2 * Math.pow(b, 2)
    );

  return distance / (255 * 3);
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
