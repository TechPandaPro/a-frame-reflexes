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

function run() {
  addEntitiesInCircle(createRandomEntity, {
    degreeIncrement: 20,
    distance: 12,
    y: 0,
  });

  updateGuideEntities(generateNextGuideEntityData());

  addEntitiesInCircle(createGuideEntity, {
    degreeIncrement: 90,
    distance: 20,
    y: 7,
  });

  addEntitiesInCircle(createScoreEntities, {
    degreeOffset: 45,
    degreeIncrement: 90,
    distance: 20,
    y: 7,
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
      ) < 0.1 ||
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
        updateGuideEntities(generateNextGuideEntityData());

        const successText = document.createElement("a-text");
        successText.setAttribute("value", "+1");
        // successText.setAttribute("material", "transparent", true);
        // successText.setAttribute("color", "#00ff00");
        successText.setAttribute("rotation", {
          x: 0,
          y: 270 - position.deg,
          z: 0,
        });
        successText.setAttribute("align", "center");
        successText.setAttribute("width", 10);

        successText.setAttribute("position", {
          x: position.x,
          y: position.y + 2,
          z: position.z,
        });
        successText.setAttribute("animation", {
          property: "position",
          to: { x: position.x, y: position.y + 2.5, z: position.z },
          dur: 500,
          easing: "easeOutQuad",
        });

        successText.setAttribute("opacity", 1);
        successText.setAttribute("animation__2", {
          property: "opacity",
          to: 0,
          dur: 500,
          easing: "easeOutQuad",
        });

        scene.appendChild(successText);
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
  newEntity.setAttribute("rotation", { x: 0, y: 90 - position.deg, z: 0 });
  newEntity.setAttribute("scale", { x: 2, y: 2, z: 2 });
  newEntity.setAttribute("animation", {
    property: "position",
    to: { x: position.x, y: position.y + 0.5, z: position.z },
    dir: "alternate",
    dur: 2000,
    easing: "easeInOutSine",
    loop: true,
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

function createScoreEntities(position) {
  const scoreRotation = { x: 0, y: 90 - position.deg, z: 0 };

  // const primaryBox = document.createElement("a-box");
  // primaryBox.setAttribute("rotation", scoreRotation);
  // // primaryBox.setAttribute("rotation", { x: 0, y: 90 - position.deg, z: 0 });
  // // primaryBox.setAttribute("rotation", { x: 0, y: position.deg + 90, z: 0 });
  // // primaryBox.setAttribute("scale", { x: 7, y: 4, z: 0.2 });
  // primaryBox.setAttribute("scale", { x: 7, y: 4, z: 0.2 });
  // primaryBox.setAttribute("position", position);
  // scene.appendChild(primaryBox);

  // const box2 = document.createElement("a-box");
  // box2.setAttribute("rotation", scoreRotation);
  // primaryBox.setAttribute("rotation", { x: 0, y: position.deg + 90, z: 0 });
  // primaryBox.setAttribute("scale", { x: 7, y: 4, z: 0.2 });
  // box2.setAttribute("scale", { x: 7, y: 1, z: 0.3 });
  // box2.setAttribute("position", {
  //   x: position.x + 0.1,
  //   y: position.y + 1.5,
  //   z: position.z,
  // });
  // scene.appendChild(box2);

  const timeText = document.createElement("a-text");
  timeText.setAttribute("value", "hello world");
  // timeText.setAttribute("color", "#ff0000");
  // successText.setAttribute("material", "transparent", true);
  // successText.setAttribute("color", "#00ff00");
  timeText.setAttribute("rotation", {
    x: 0,
    y: scoreRotation,
    z: 0,
  });
  timeText.setAttribute("align", "center");
  // timeText.setAttribute("width", 10);
  timeText.setAttribute("position", position);
  // timeText.setAttribute("scale", { x: 100, y: 100, z: 100 });
  scene.appendChild(timeText);
}

function addEntitiesInCircle(callback, options = {}) {
  const degreeOffset = options.degreeOffset ?? 0;
  const degreeIncrement = options.degreeIncrement ?? 20;
  const distance = options.distance ?? 10;
  const y = options.y ?? 0;

  for (let deg = degreeOffset; deg < 360; deg += degreeIncrement) {
    const rad = deg * (Math.PI / 180);
    const x = Math.cos(rad) * distance;
    const z = Math.sin(rad) * distance;
    callback({ x, y, z, deg });
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
