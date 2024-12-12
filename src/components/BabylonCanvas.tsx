import React, { useEffect, useRef } from "react";
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";

import * as BABYLON from "@babylonjs/core";

const SwingButton = (name: string, imageUrl: string): GUI.Button => {
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

const BabylonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = (): BABYLON.Scene => {
      const scene = new BABYLON.Scene(engine);

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

      // material
      const silverShiny = new BABYLON.PBRMaterial("silverShiny", scene);
      const redShiny = new BABYLON.PBRMaterial("redShiny", scene);

      // Set properties for metallic and shiny appearance
      silverShiny.metallic = 1;
      redShiny.metallic = 1;
      silverShiny.roughness = 0.18;
      redShiny.roughness = 0.1;

      // Set the albedo color (base color for the material)
      silverShiny.albedoColor = new BABYLON.Color3(
        0.05 / 4,
        0.12 / 4,
        0.25 / 4
      );
      redShiny.albedoColor = new BABYLON.Color3(0.9, 0.4, 0.1);

      // Add an environment texture for reflections (using a simple skybox or HDR texture)
      scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        "https://assets.babylonjs.com/environments/environmentSpecular.env",
        scene
      );

      BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "scenes/",
        "cricket_stadium.glb"
      ).then((value) => {
        value.meshes[14].position = new BABYLON.Vector3(0, 0, 1);
      });

      BABYLON.SceneLoader.ImportMeshAsync("", "scenes/", "logo.glb").then(
        (value) => {
          const rootMesh = value.meshes[0];
          rootMesh.position = new BABYLON.Vector3(-18, 0, 50);
          rootMesh.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
          rootMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
          rootMesh.parent = camera;
          value.meshes[2].material = redShiny;
          value.meshes[1].material = silverShiny;
        }
      );

      // controls
      const advancedTexture =
        GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

      // const swingLeftButton = SwingButton(
      //   "swingLeft",
      //   "images/cricketBatLeft.png"
      // );
      // swingLeftButton.top = "-50px";
      // swingLeftButton.left = "-100px";

      // const swingRightButton = SwingButton(
      //   "swingRight",
      //   "images/cricketBatRight.png"
      // );
      // swingRightButton.top = "-50px";
      // swingRightButton.left = "100px";

      // advancedTexture.addControl(swingLeftButton);
      // advancedTexture.addControl(swingRightButton);

      const startButton = GUI.Button.CreateSimpleButton(
        "startButton",
        "< Start >"
      );
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
      advancedTexture.addControl(startButton);

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
        touchAction: "none", // Prevents default touch actions for better control
      }}
    />
  );
};

export default BabylonCanvas;
