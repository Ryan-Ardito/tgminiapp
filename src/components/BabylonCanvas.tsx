import React, { useEffect, useRef } from "react";

import "@babylonjs/loaders";
import "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

const POSITIONS = {
  logo: new BABYLON.Vector3(-18, 10, 60),
  bowler: new BABYLON.Vector3(9, 0, 1),
  batter: new BABYLON.Vector3(-9, 0, 1),
  batterCam: new BABYLON.Vector3(-15, 4, 0),
};

type GameData = {
  gameMeshes: { [key: string]: BABYLON.AbstractMesh };
  pbrMaterials: { [key: string]: BABYLON.PBRMaterial };
};

const gameData: GameData = {
  gameMeshes: {},
  pbrMaterials: {},
};

const randomFielderPositions = (numFielders: number): BABYLON.Vector3[] => {
  const positions = [];
  const fieldRadius = 50;
  const minRadius = 25;
  const angleStep = (2 * Math.PI) / numFielders;

  for (let i = 0; i < numFielders; i++) {
    const distance = Math.random() * (fieldRadius - minRadius) + minRadius;
    const angleVariance = angleStep * Math.random() - 0.5;
    const angle = i * angleStep + angleVariance;
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    positions.push(new BABYLON.Vector3(x, 0, z));
  }

  return positions;
};

const createSwingButton = (name: string, imageUrl: string): GUI.Button => {
  const button = GUI.Button.CreateImageButton(name, "", imageUrl);

  button.width = "100px";
  button.height = "100px";
  button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  button.color = "white";
  button.background = "navy";
  button.cornerRadius = 100;
  button.thickness = 3;

  const image = button.image!;
  image.width = "60%";
  image.height = "60%";
  image.stretch = GUI.Image.STRETCH_UNIFORM;
  image.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  image.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

  return button;
};

const createStartButton = () => {
  const startButton = GUI.Button.CreateSimpleButton("startButton", "< Start >");
  startButton.width = "160px";
  startButton.height = "70px";
  startButton.top = "-80px";
  startButton.color = "white";
  startButton.background = "navy";
  startButton.cornerRadius = 40;
  startButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  startButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  startButton.thickness = 3;
  startButton.fontSize = 24;
  startButton.fontWeight = "bold";

  return startButton;
};

const resetLogoRotation = (
  mesh: BABYLON.AbstractMesh,
  targetRotation: BABYLON.Vector3,
  scene: BABYLON.Scene
) => {
  // Snap back to original rotation with animation
  const snapBackAnimation = new BABYLON.Animation(
    "snapBack",
    "rotation",
    60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    {
      frame: 0,
      value: mesh.rotation.clone(),
    },
    {
      frame: 10,
      value: targetRotation.clone(),
    },
  ];

  snapBackAnimation.setKeys(keys);
  mesh.animations = [];
  mesh.animations.push(snapBackAnimation);

  scene.beginAnimation(mesh, 0, 10, false);
};

const logoRotationControl = (
  mesh: BABYLON.AbstractMesh,
  scene: BABYLON.Scene
) => {
  const sensitivity = 0.005;
  const rotationLimit = Math.PI / 8;
  const originalRotation = mesh.rotation.clone();
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  scene.onPointerDown = (evt) => {
    isDragging = true;
    lastPointerX = evt.clientX;
    lastPointerY = evt.clientY;
  };

  scene.onPointerMove = (evt) => {
    if (!isDragging) return;

    const deltaX = evt.clientX - lastPointerX;
    const deltaY = evt.clientY - lastPointerY;

    // Apply rotation with limits
    mesh.rotation.y = BABYLON.Scalar.Clamp(
      mesh.rotation.y - deltaX * sensitivity,
      originalRotation.y - rotationLimit,
      originalRotation.y + rotationLimit
    );

    mesh.rotation.x = BABYLON.Scalar.Clamp(
      mesh.rotation.x - deltaY * sensitivity,
      originalRotation.x - rotationLimit,
      originalRotation.x + rotationLimit
    );

    lastPointerX = evt.clientX;
    lastPointerY = evt.clientY;
  };

  scene.onPointerUp = () => {
    isDragging = false;
    resetLogoRotation(mesh, originalRotation, scene);
  };
};

const createCamera = (scene: BABYLON.Scene): BABYLON.ArcRotateCamera => {
  const camera = new BABYLON.ArcRotateCamera(
    "camera1",
    0,
    1.2,
    60,
    new BABYLON.Vector3(0, 12, 0),
    scene
  );

  camera.fov = 1.2;
  camera.alpha = Math.PI;
  // camera.attachControl(canvas, true);
  // camera.upperBetaLimit = Math.PI / 2 - 0.14;
  // camera.lowerBetaLimit = 0.8;
  // camera.lowerRadiusLimit = 6;
  // camera.upperRadiusLimit = 60;

  // camera movement
  scene.onBeforeRenderObservable.add(() => {
    camera.alpha += 0.001;
  });

  return camera;
};

const createLighting = (scene: BABYLON.Scene) => {
  const sunlight = new BABYLON.DirectionalLight(
    "sunlight",
    new BABYLON.Vector3(-1, -2, -1),
    scene
  );
  sunlight.position = new BABYLON.Vector3(10, 10, 10);
  sunlight.intensity = 2;

  // ambient
  // const skylight = new BABYLON.HemisphericLight(
  //   "light",
  //   new BABYLON.Vector3(0, 1, 0),
  //   scene
  // );
  // skylight.intensity = 0.3;

  return { sunlight };
};

const flyToBatter = (camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene) => {
  const flyAnimation = new BABYLON.Animation(
    "flyToBatter",
    "position",
    60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    {
      frame: 0,
      value: camera.position.clone(),
    },
    {
      frame: 30,
      value: POSITIONS.batterCam,
    },
  ];

  flyAnimation.setKeys(keys);
  camera.animations = [];
  camera.animations.push(flyAnimation);

  scene.onBeforeRenderObservable.clear(); //stop the camera rotation

  camera.setTarget(new BABYLON.Vector3(0, 2, 0));
  scene.beginAnimation(camera, 0, 30, false);
};

const createMaterials = (scene: BABYLON.Scene) => {
  const navyMatte = new BABYLON.PBRMaterial("silverShiny", scene);
  navyMatte.metallic = 1;
  navyMatte.roughness = 0.18;
  navyMatte.albedoColor = new BABYLON.Color3(0.05 / 4, 0.12 / 4, 0.25 / 4);

  const goldShiny = new BABYLON.PBRMaterial("redShiny", scene);
  goldShiny.metallic = 1;
  goldShiny.roughness = 0.1;
  goldShiny.albedoColor = new BABYLON.Color3(0.9, 0.4, 0.1);

  return { goldShiny, navyMatte };
};

const loadMeshes = (
  assetsManager: BABYLON.AssetsManager,
  camera: BABYLON.ArcRotateCamera,
  scene: BABYLON.Scene
) => {
  const stadiumMeshTask = assetsManager.addMeshTask(
    "stadiumMeshTask",
    "",
    "scenes/",
    "cricket_stadium.glb"
  );
  stadiumMeshTask.onSuccess = (task) => {
    gameData.gameMeshes.stadium = task.loadedMeshes[0];
    task.loadedMeshes[14].position = new BABYLON.Vector3(0, 0, 0);
  };

  const logoMeshTask = assetsManager.addMeshTask(
    "logoMeshTask",
    "",
    "scenes/",
    "logo.glb"
  );
  logoMeshTask.onSuccess = (task) => {
    const rootMesh = task.loadedMeshes[0];
    gameData.gameMeshes.logo = rootMesh;
    rootMesh.position = POSITIONS.logo;
    rootMesh.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
    rootMesh.setPivotPoint(new BABYLON.Vector3(18, 0, -10));
    rootMesh.parent = camera;
    task.loadedMeshes[2].material = gameData.pbrMaterials.goldShiny;
    task.loadedMeshes[1].material = gameData.pbrMaterials.navyMatte;

    logoRotationControl(rootMesh, scene);
  };

  // Load the batter model
  const batterMeshTask = assetsManager.addMeshTask(
    "batterMeshTask",
    "",
    "scenes/batter/",
    "batterDragBat.glb"
  );
  batterMeshTask.onSuccess = (task) => {
    const batter = task.loadedMeshes[0];
    gameData.gameMeshes.batter = batter;
    batter.position = POSITIONS.batter;
    batter.scaling = new BABYLON.Vector3(1, 1, 1);
  };

  // Load the bowler model
  const bowlerMeshTask = assetsManager.addMeshTask(
    "bowlerMeshTask",
    "",
    "scenes/bowler/",
    "bowlerIdle.glb"
  );
  bowlerMeshTask.onSuccess = (task) => {
    const bowler = task.loadedMeshes[0];
    gameData.gameMeshes.bowler = bowler;
    bowler.position = POSITIONS.bowler;
    bowler.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    bowler.scaling = new BABYLON.Vector3(1, 1, 1);
  };

  // Load the fielder model
  const fielderMeshTask = assetsManager.addMeshTask(
    "fielderMeshTask",
    "",
    "scenes/fielder/",
    "fielderIdle.glb"
  );
  fielderMeshTask.onSuccess = (task) => {
    // stop animations
    task.loadedAnimationGroups.forEach((value) => value.stop());

    const fielder = task.loadedMeshes[0] as BABYLON.Mesh;
    fielder.scaling = new BABYLON.Vector3(1, 1, 1);
    const positions = randomFielderPositions(9);
    for (let i = 0; i < 9; i++) {
      const fielderName = `fielder${i}`;
      const fielderInstance = fielder.clone(fielderName);
      gameData.gameMeshes[fielderName] = fielderInstance;
      fielderInstance.position = positions[i];
      fielderInstance.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
      fielderInstance.lookAt(new BABYLON.Vector3(0, 1, 0));
    }
    task.loadedMeshes.forEach((value) => {
      value.isVisible = false;
    });
  };
};

const createControls = (
  camera: BABYLON.ArcRotateCamera,
  scene: BABYLON.Scene
) => {
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const swingLeftButton = createSwingButton(
    "swingLeft",
    "images/cricketBatLeft.png"
  );
  swingLeftButton.top = "-50px";
  swingLeftButton.left = "-100px";

  const swingRightButton = createSwingButton(
    "swingRight",
    "images/cricketBatRight.png"
  );
  swingRightButton.top = "-50px";
  swingRightButton.left = "100px";

  const startButton = createStartButton();
  advancedTexture.addControl(startButton);

  startButton.onPointerUpObservable.add(() => {
    // hide logo
    gameData.gameMeshes.logo.setEnabled(false);

    // hide start button
    advancedTexture.removeControl(startButton);

    // show swing buttons
    advancedTexture.addControl(swingLeftButton);
    advancedTexture.addControl(swingRightButton);

    flyToBatter(camera, scene);
  });
};

const createScene = (engine: BABYLON.Engine): BABYLON.Scene => {
  const scene = new BABYLON.Scene(engine);
  const assetsManager = new BABYLON.AssetsManager(scene);

  // sky
  scene.clearColor = new BABYLON.Color4(0.4, 0.7, 0.9, 1.0);

  const camera = createCamera(scene);

  const { sunlight } = createLighting(scene);

  // materials
  const { goldShiny, navyMatte } = createMaterials(scene);
  gameData.pbrMaterials.goldShiny = goldShiny;
  gameData.pbrMaterials.navyMatte = navyMatte;

  // HDRI map
  scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
    "https://assets.babylonjs.com/environments/environmentSpecular.env",
    scene
  );

  // controls
  createControls(camera, scene);

  // meshes
  loadMeshes(assetsManager, camera, scene);

  assetsManager.load();

  return scene;
};

const BabylonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);

    const scene = createScene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = (): void => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    // debug console
    window.addEventListener("keydown", (ev) => {
      // shift+ctrl+alt+i
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
      scene.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100vh",
        display: "block",
        touchAction: "none",
      }}
    />
  );
};

export default BabylonCanvas;
