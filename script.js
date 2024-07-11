const scene = document.querySelector("a-scene");

const ambientLight = document.getElementById("ambientLight");
const pointLight = document.getElementById("pointLight");

let ambientLightOriginalIntensity;
let pointLightOriginalIntensity;

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
  "torusKnot",
];

if (scene.hasLoaded) run();
else scene.addEventListener("loaded", run, { once: true });

let guideGeometry;
let guideColorR;
let guideColorG;
let guideColorB;
let guideColor;

let roundOver = true;
let playUntil;
let score;
let incorrectClicks;

const scorePlanes = [];
const guideEntities = [];
const existingEntities = [];

AFRAME.registerComponent("scoreboard", {
  tick: function () {
    this.el.setAttribute("text", {
      value: `Time: ${formatTimeLeft()}
Score: ${score}`,
      color: "#ffff00",
      wrapPixels: 350,
      xOffset: 0.5,
      zOffset: 0.02,
    });
  },
});

function run() {
  resetRound();

  if (getStoredData().finishedTutorial ?? false) startRound();
  else {
    const tutorialBoard = document.createElement("a-plane");
    const pos = getPosDistanceAwayFromCamera(8);
    tutorialBoard.setAttribute("rotation", pos.rot);
    tutorialBoard.setAttribute("position", pos.pos);
    tutorialBoard.setAttribute("width", 7);
    tutorialBoard.setAttribute("height", 4.8);
    tutorialBoard.setAttribute("material", {
      color: "#1c1c1c",
      shader: "flat",
      side: "double",
    });

    const tutorialBoardText = document.createElement("a-text");
    tutorialBoardText.setAttribute("anchor", "center");
    tutorialBoardText.setAttribute("position", { x: 0, y: 0.45, z: 0.02 });
    tutorialBoardText.setAttribute("color", "#ffffff");
    tutorialBoardText.setAttribute("wrap-pixels", 800);
    tutorialBoardText.setAttribute("scale", { x: 1.15, y: 1.15, z: 1 });
    tutorialBoard.appendChild(tutorialBoardText);

    const startBtn = document.createElement("a-plane");
    startBtn.setAttribute("width", 2.3);
    startBtn.setAttribute("height", 0.7);
    startBtn.setAttribute("position", { x: 0, y: -1.6, z: 0.02 });
    startBtn.setAttribute("material", {
      color: "#404040",
      shader: "flat",
    });
    startBtn.setAttribute("text", {
      value: "Next",
      align: "center",
      color: "#ffffff",
      wrapPixels: 275,
      zOffset: 0.02,
    });
    startBtn.addEventListener("mouseenter", () =>
      startBtn.setAttribute("material", "color", "#4d4d4d")
    );
    startBtn.addEventListener("mouseleave", () =>
      startBtn.setAttribute("material", "color", "#404040")
    );
    tutorialBoard.appendChild(startBtn);

    // to keep all the vars that need to be shared between steps organized
    const stepVars = {};

    const steps = [
      () => {
        tutorialBoardText.setAttribute(
          "value",
          "Welcome to A-Frame Reflexes! This is a game built with A-Frame that relies on your speed, memory, and reflexes in order to get a high score."
        );
      },
      () => {
        tutorialBoardText.setAttribute(
          "value",
          "You'll notice that you are surrounded by various colored shapes. These are the shapes that you interact with (e.g. click)."
        );

        dimLights();

        const target = document.createElement("a-entity");
        // target.setAttribute("geometry", "primitive", "box");
        target.setAttribute("position", { x: 0, y: 0, z: 0 });
        scene.appendChild(target);

        stepVars.bottomTarget = target;

        const bottomSpot = document.createElement("a-light");
        bottomSpot.setAttribute("type", "spot");
        bottomSpot.setAttribute("light", "target", target);
        bottomSpot.setAttribute("angle", 90);
        bottomSpot.setAttribute("intensity", 0);
        bottomSpot.setAttribute("penumbra", 0.2);
        bottomSpot.setAttribute("position", { x: 0, y: 4, z: 0 });
        bottomSpot.setAttribute("animation", {
          property: "intensity",
          to: 2,
          dur: 200,
          easing: "easeInOutQuad",
        });
        scene.appendChild(bottomSpot);

        stepVars.bottomSpot = bottomSpot;
      },
      () => {
        tutorialBoardText.setAttribute(
          "value",
          "You know which colored shapes to click by referencing the floating shapes. These four shapes are all identical and surround you. The scoreboards behave in the same manner. As such, the pertinent details will always be within your field of vision."
        );

        stepVars.bottomSpot.setAttribute("animation", {
          property: "intensity",
          to: 0,
          dur: 200,
          easing: "easeOutQuad",
        });

        setTimeout(() => {
          stepVars.bottomTarget.parentElement.removeChild(
            stepVars.bottomTarget
          );
          stepVars.bottomSpot.parentElement.removeChild(stepVars.bottomSpot);
        }, 200);

        const target = document.createElement("a-entity");
        // target.setAttribute("geometry", "primitive", "box");
        target.setAttribute("position", { x: 0, y: 14, z: 0 });
        scene.appendChild(target);

        stepVars.topTarget = target;

        const topSpot = document.createElement("a-light");
        topSpot.setAttribute("type", "spot");
        topSpot.setAttribute("light", "target", target);
        topSpot.setAttribute("angle", 85);
        topSpot.setAttribute("intensity", 0);
        topSpot.setAttribute("penumbra", 0.2);
        topSpot.setAttribute("position", { x: 0, y: 0, z: 0 });
        topSpot.setAttribute("animation", {
          property: "intensity",
          to: 2,
          dur: 200,
          easing: "easeInOutQuad",
          // loop: true,
        });
        scene.appendChild(topSpot);

        stepVars.topSpot = topSpot;
      },
      () => {
        tutorialBoardText.setAttribute(
          "value",
          "Each shape you correctly click adds +1 to your score. Your score is not penalized for incorrect clicks, but you will be shown this data (# of incorrect clicks) at the end of each round."
        );

        stepVars.topSpot.setAttribute("animation", {
          property: "intensity",
          to: 0,
          dur: 200,
          easing: "easeOutQuad",
        });

        setTimeout(() => {
          stepVars.topTarget.parentElement.removeChild(stepVars.topTarget);
          stepVars.topSpot.parentElement.removeChild(stepVars.topSpot);
        }, 200);
      },
      () => {
        tutorialBoardText.setAttribute(
          "value",
          "Each round lasts 30 seconds, and your goal is to get the highest score possible within that time frame. Ready to get started?"
        );

        startBtn.setAttribute("text", "value", "I'm Ready!");
      },
      () => {
        tutorialBoard.parentElement.removeChild(tutorialBoard);

        const data = getStoredData();
        data.finishedTutorial = true;
        saveStoredData(data);

        brightenLights();

        setTimeout(startRound, 200);
      },
    ];

    let step = 0;

    steps[step]();

    startBtn.addEventListener("click", () => {
      step++;
      steps[step]();
    });

    scene.appendChild(tutorialBoard);
  }
}

function createRandomEntity(position, existingEntityObj) {
  let generateNew = true;

  while (generateNew) {
    const newEntityGeometry =
      potentialGeometries[getRandomInt(0, potentialGeometries.length)];

    const newEntityColorR = getRandomIntInclusive(0, 255);
    const newEntityColorG = getRandomIntInclusive(0, 255);
    const newEntityColorB = getRandomIntInclusive(0, 255);

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

    let entityObj;

    if (existingEntityObj) entityObj = existingEntityObj;
    else {
      entityObj = {
        entity: null,
        color: { r: null, g: null, b: null },
        geometry: null,
      };
      entityObj.entity = document.createElement(`a-entity`);
      entityObj.entity.setAttribute("material", "src", "#entityTexture");
      entityObj.entity.setAttribute("position", position);
      entityObj.entity.setAttribute("animation", {
        property: "rotation",
        to: { x: 0, y: 360, z: 0 },
        dur: 20000,
        easing: "linear",
        loop: true,
      });
      entityObj.entity.addEventListener("click", () => {
        if (roundOver) return;

        if (
          entityObj.geometry === guideGeometry &&
          entityObj.color.r === guideColorR &&
          entityObj.color.g === guideColorG &&
          entityObj.color.b === guideColorB
        ) {
          score++;

          updateGuideEntities(generateNextGuideEntityData());

          const successText = document.createElement("a-text");
          successText.setAttribute("value", "+1");
          successText.setAttribute("rotation", {
            x: 0,
            y: 270 - position.deg,
            z: 0,
          });
          successText.setAttribute("align", "center");
          successText.setAttribute("width", 16);

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
          incorrectClicks++;

          const light = document.createElement("a-entity");
          light.setAttribute("light", {
            type: "spot",
            color: "#ff0000",
            intensity: 10,
            penumbra: 0,
            angle: 10,
            target: entityObj.entity,
          });
          scene.append(light);
          setTimeout(() => light.parentElement.removeChild(light), 100);
        }
      });
      scene.appendChild(entityObj.entity);
    }

    entityObj.color.r = newEntityColorR;
    entityObj.color.g = newEntityColorG;
    entityObj.color.b = newEntityColorB;
    entityObj.geometry = newEntityGeometry;

    entityObj.entity.setAttribute("geometry", "primitive", entityObj.geometry);
    entityObj.entity.setAttribute(
      "material",
      "color",
      `rgb(${entityObj.color.r}, ${entityObj.color.g}, ${entityObj.color.b})`
    );

    existingEntities.push(entityObj);
  }
}

function startRound() {
  playUntil = Date.now() + 30000;
  setTimeout(() => {
    const data = getStoredData();
    let newHighScore = false;
    if (score > (data.highScore ?? 0)) {
      if ((data.highScore ?? 0) >= 1) newHighScore = true;
      data.highScore = score;
      saveStoredData(data);
    }
    addRoundOverPlane({ newHighScore });
  }, playUntil - Date.now());
  roundOver = false;
}

function resetRound() {
  score = 0;
  incorrectClicks = 0;

  if (existingEntities.length === 0) {
    addEntitiesInCircle(createRandomEntity, {
      degreeIncrement: 20,
      distance: 12,
      y: 0,
    });
  } else {
    const existingEntitiesCopy = [...existingEntities];
    existingEntities.splice(0, existingEntities.length);
    for (const existingEntity of existingEntitiesCopy)
      createRandomEntity(
        existingEntity.entity.getAttribute("position"),
        existingEntity
      );
  }

  updateGuideEntities(generateNextGuideEntityData());

  if (guideEntities.length === 0)
    addEntitiesInCircle(createGuideEntity, {
      degreeIncrement: 90,
      distance: 20,
      y: 7,
    });

  if (scorePlanes.length === 0)
    addEntitiesInCircle(createScoreEntities, {
      degreeOffset: 45,
      degreeIncrement: 90,
      distance: 20,
      y: 7,
    });
}

function dimLights() {
  ambientLightOriginalIntensity = ambientLight.getAttribute(
    "light",
    "intensity"
  ).intensity;

  pointLightOriginalIntensity = pointLight.getAttribute(
    "light",
    "intensity"
  ).intensity;

  ambientLight.setAttribute("animation", {
    property: "light.intensity",
    to: 0,
    dur: 200,
    easing: "easeInOutQuad",
  });

  pointLight.setAttribute("animation", {
    property: "light.intensity",
    to: 0.2,
    dur: 200,
    easing: "easeInOutQuad",
  });
}

function brightenLights() {
  ambientLight.setAttribute("animation", {
    property: "light.intensity",
    to: ambientLightOriginalIntensity,
    dur: 200,
    easing: "easeInOutQuad",
  });

  pointLight.setAttribute("animation", {
    property: "light.intensity",
    to: pointLightOriginalIntensity,
    dur: 200,
    easing: "easeInOutQuad",
  });
}

function addRoundOverPlane(options = {}) {
  roundOver = true;

  const { newHighScore = false } = options;

  dimLights();

  const pos = getPosDistanceAwayFromCamera(10);

  const roundOverSpotTarget = document.createElement("a-entity");
  // roundOverSpotTarget.setAttribute("geometry", "primitive", "box");
  roundOverSpotTarget.setAttribute("position", {
    x: pos.pos.x,
    y: pos.pos.y + 7,
    z: pos.pos.z,
  });
  roundOverSpotTarget.setAttribute("animation", {
    property: "position",
    to: pos.pos,
    dur: 300,
    easing: "easeInOutQuad",
  });
  scene.appendChild(roundOverSpotTarget);

  const roundOverSpot = document.createElement("a-light");
  roundOverSpot.setAttribute("type", "spot");
  roundOverSpot.setAttribute("light", "target", roundOverSpotTarget);
  roundOverSpot.setAttribute("angle", 20);
  roundOverSpot.setAttribute("intensity", 0);
  roundOverSpot.setAttribute("penumbra", 0.2);
  roundOverSpot.setAttribute(
    "position",
    scene.camera.el.getAttribute("position")
  );
  roundOverSpot.setAttribute("animation", {
    property: "intensity",
    to: 2,
    dur: 200,
    easing: "easeInOutQuad",
  });
  scene.appendChild(roundOverSpot);

  const endBoard = document.createElement("a-plane");
  endBoard.setAttribute("rotation", pos.rot);
  endBoard.setAttribute("position", pos.pos);
  endBoard.setAttribute("width", 7);
  endBoard.setAttribute("height", 5);
  endBoard.setAttribute("material", {
    color: "#1c1c1c",
    shader: "phong",
    side: "double",
  });

  const endBoardText = document.createElement("a-text");
  endBoardText.setAttribute(
    "value",
    `Round Over!

Score: ${score}
High Score: ${getStoredData().highScore ?? 0}
Incorrect Clicks: ${incorrectClicks}`
  );
  endBoardText.setAttribute("anchor", "center");
  endBoardText.setAttribute("position", { x: 0, y: 0.55, z: 0.02 });
  endBoardText.setAttribute("text", "xOffset", 0.15);
  endBoardText.setAttribute("color", "#ffff00");
  endBoardText.setAttribute("wrap-pixels", 400);
  endBoardText.setAttribute("scale", { x: 1.05, y: 1.05, z: 1 });
  endBoard.appendChild(endBoardText);

  if (newHighScore) {
    const newHighScoreText = document.createElement("a-text");
    newHighScoreText.setAttribute("value", "New High Score!");
    newHighScoreText.setAttribute("color", "#ffff00");
    newHighScoreText.setAttribute("width", 10);
    newHighScoreText.setAttribute("align", "center");
    newHighScoreText.setAttribute("position", { x: 1.4, y: 0.65, z: 0.02 });
    newHighScoreText.setAttribute("rotation", "z", -14);
    newHighScoreText.setAttribute("animation", {
      property: "scale",
      to: { x: 1.1, y: 1.1, z: 1 },
      dir: "alternate",
      dur: 500,
      easing: "easeInOutQuad",
      loop: true,
    });
    endBoard.appendChild(newHighScoreText);
  }

  const newRoundBtn = document.createElement("a-plane");
  newRoundBtn.setAttribute("width", 2.3);
  newRoundBtn.setAttribute("height", 0.7);
  newRoundBtn.setAttribute("position", { x: 0, y: -1.6, z: 0.02 });
  newRoundBtn.setAttribute("material", {
    color: "#404040",
    shader: "phong",
  });
  newRoundBtn.setAttribute("text", {
    value: "New Round",
    align: "center",
    color: "#ffffff",
    wrapPixels: 275,
    zOffset: 0.02,
  });
  newRoundBtn.addEventListener("mouseenter", () =>
    newRoundBtn.setAttribute("material", "color", "#4d4d4d")
  );
  newRoundBtn.addEventListener("mouseleave", () =>
    newRoundBtn.setAttribute("material", "color", "#404040")
  );
  newRoundBtn.addEventListener(
    "click",
    () => {
      endBoard.parentElement.removeChild(endBoard);
      roundOverSpotTarget.parentElement.removeChild(roundOverSpotTarget);
      roundOverSpot.parentElement.removeChild(roundOverSpot);
      resetRound();
      brightenLights();
      setTimeout(() => startRound(), 200);
    },
    { once: true }
  );
  endBoard.appendChild(newRoundBtn);

  scene.appendChild(endBoard);
}

function getPosDistanceAwayFromCamera(distance) {
  const cameraPos = scene.camera.el.getAttribute("position");
  const cameraRot = scene.camera.el.getAttribute("rotation");

  const xOffset = distance * Math.sin(cameraRot.y * (Math.PI / 180));
  const zOffset = distance * Math.cos(cameraRot.y * (Math.PI / 180));

  return {
    pos: {
      x: cameraPos.x - xOffset,
      y: cameraPos.y,
      z: cameraPos.z - zOffset,
    },
    rot: { x: 0, y: cameraRot.y, z: cameraRot.z },
  };
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
  newEntity.setAttribute("material", "src", "#entityTexture");
  updateGuideEntityFromVars(newEntity);
  scene.appendChild(newEntity);
  guideEntities.push(newEntity);
}

function generateNextGuideEntityData() {
  const randomEntity =
    existingEntities[getRandomInt(0, existingEntities.length)];
  return { color: randomEntity.color, geometry: randomEntity.geometry };
}

function createScoreEntities(position) {
  const plane = document.createElement("a-plane");
  plane.setAttribute("scoreboard", "");
  plane.setAttribute("width", 7);
  plane.setAttribute("height", 4);
  plane.setAttribute("position", position);
  plane.setAttribute("rotation", { x: 0, y: 270 - position.deg, z: 0 });
  plane.setAttribute("material", {
    color: "#121212",
    shader: "phong",
    side: "double",
  });
  scene.appendChild(plane);

  scorePlanes.push(plane);
}

function formatTimeLeft() {
  const timeLeftSeconds = roundOver
    ? 0
    : Math.ceil(Math.max(playUntil - Date.now(), 0) / 1000);

  const roundMinutes = Math.floor(timeLeftSeconds / 60);
  const roundSeconds = timeLeftSeconds % 60;

  return `${roundMinutes.toString().padStart(2, "0")}:${roundSeconds
    .toString()
    .padStart(2, "0")}`;
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
  guideEntity.setAttribute("geometry", "primitive", guideGeometry);
  guideEntity.setAttribute("material", "color", guideColor);
}

function getStoredData() {
  return JSON.parse(localStorage.getItem("data") ?? "{}");
}

function saveStoredData(data) {
  if (data) localStorage.setItem("data", JSON.stringify(data));
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
