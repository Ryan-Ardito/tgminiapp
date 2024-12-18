import React, { useEffect, useRef } from "react";
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";

import * as BABYLON from "@babylonjs/core";

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

const resetLogoRotationWithAnimation = (
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

const rotationControl = (mesh: BABYLON.AbstractMesh, scene: BABYLON.Scene) => {
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
    resetLogoRotationWithAnimation(mesh, originalRotation, scene);
  };
};

const BabylonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = (): BABYLON.Scene => {
      const scene = new BABYLON.Scene(engine);
      const assetsManager = new BABYLON.AssetsManager(scene);

      // sky
      scene.clearColor = new BABYLON.Color4(0.4, 0.7, 0.9, 1.0);

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

      // Light
      // const skylight = new BABYLON.HemisphericLight(
      //   "light",
      //   new BABYLON.Vector3(0, 1, 0),
      //   scene
      // );
      // skylight.intensity = 0.3;

      const sunlight = new BABYLON.DirectionalLight(
        "skylight",
        new BABYLON.Vector3(-1, -2, -1),
        scene
      );
      sunlight.position = new BABYLON.Vector3(10, 10, 10);
      sunlight.intensity = 2;

      // materials
      const silverShiny = new BABYLON.PBRMaterial("silverShiny", scene);
      const redShiny = new BABYLON.PBRMaterial("redShiny", scene);

      silverShiny.metallic = 1;
      redShiny.metallic = 1;
      silverShiny.roughness = 0.18;
      redShiny.roughness = 0.1;

      silverShiny.albedoColor = new BABYLON.Color3(
        0.05 / 4,
        0.12 / 4,
        0.25 / 4
      );
      redShiny.albedoColor = new BABYLON.Color3(0.9, 0.4, 0.1);

      // HDRI map
      scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        "https://assets.babylonjs.com/environments/environmentSpecular.env",
        scene
      );

      const stadiumMeshTask = assetsManager.addMeshTask(
        "stadiumMeshTask",
        "",
        "scenes/",
        "cricket_stadium.glb"
      );

      stadiumMeshTask.onSuccess = (task) => {
        task.loadedMeshes[14].position = new BABYLON.Vector3(0, 0, 0);
      };

      let logo: BABYLON.AbstractMesh;
      const logoMeshTask = assetsManager.addMeshTask(
        "logoMeshTask",
        "",
        "scenes/",
        "logo.glb"
      );
      logoMeshTask.onSuccess = (task) => {
        const rootMesh = task.loadedMeshes[0];
        logo = rootMesh;
        rootMesh.position = new BABYLON.Vector3(-18, 10, 60);
        rootMesh.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
        rootMesh.setPivotPoint(new BABYLON.Vector3(18, 0, -10));
        rootMesh.parent = camera;
        task.loadedMeshes[2].material = redShiny;
        task.loadedMeshes[1].material = silverShiny;

        rotationControl(rootMesh, scene);
      };

      // Load the batter model
      // const batterMeshTask = assetsManager.addMeshTask(
      //   "batterMeshTask",
      //   "",
      //   "scenes/batter/",
      //   "batterDragBat.glb"
      // );
      // batterMeshTask.onSuccess = (task) => {
      //   const batter = task.loadedMeshes[0];
      //   batter.position = new BABYLON.Vector3(-9, 0.5, 1);
      //   batter.scaling = new BABYLON.Vector3(1, 1, 1);
      // };

      // Load the bowler model
      // const bowlerMeshTask = assetsManager.addMeshTask(
      //   "bowlerMeshTask",
      //   "",
      //   "scenes/bowler/",
      //   "bowlerIdle.glb"
      // );
      // bowlerMeshTask.onSuccess = (task) => {
      //   const bowler = task.loadedMeshes[0];
      //   bowler.position = new BABYLON.Vector3(9, 0.5, 1);
      //   bowler.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
      //   bowler.scaling = new BABYLON.Vector3(1, 1, 1);
      // };

      // controls
      const advancedTexture =
        GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

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
        logo.setEnabled(false);

        // hide start button
        advancedTexture.removeControl(startButton);

        // show swing buttons
        advancedTexture.addControl(swingLeftButton);
        advancedTexture.addControl(swingRightButton);

        const flyToBatter = new BABYLON.Animation(
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
            value: new BABYLON.Vector3(-15, 4, 0),
          },
        ];

        flyToBatter.setKeys(keys);
        camera.animations = [];
        camera.animations.push(flyToBatter);

        scene.onBeforeRenderObservable //stop the camera rotation
          .clear();

        camera.setTarget(new BABYLON.Vector3(0, 2, 0));
        scene.beginAnimation(camera, 0, 30, false);

        // Pan the camera to the wicket 10m behind the origin
        // camera.setPosition(new BABYLON.Vector3(-14, 4, 0.4));
        // rotate the camera to face the wicket
        // camera.alpha = Math.PI;
      });

      assetsManager.load();

      return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = (): void => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

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
