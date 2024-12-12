import React, { useEffect, useRef } from "react";
import "@babylonjs/loaders";
import * as GUI from "@babylonjs/gui";

import {
  Vector3,
  HemisphericLight,
  Scene,
  Engine,
  SceneLoader,
  ArcRotateCamera,
} from "@babylonjs/core";

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
    const engine = new Engine(canvas, true);

    const createScene = (): Scene => {
      const scene = new Scene(engine);

      const camera = new ArcRotateCamera(
        "camera1",
        Math.PI / 2,
        Math.PI / 4,
        6,
        new Vector3(-28, 2, -15),
        scene
      );

      camera.attachControl(canvas, true);
      camera.setTarget(Vector3.Zero());
      camera.upperBetaLimit = Math.PI / 2 - 0.14;
      camera.lowerBetaLimit = 0.8;
      camera.fov = 1.2;
      camera.lowerRadiusLimit = 6;
      camera.upperRadiusLimit = 60;

      // Light
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 1.2;

      const mesh = SceneLoader.ImportMeshAsync(
        "",
        "scenes/",
        "cricket_stadium.glb"
      );

      const advancedTexture =
        GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

      const swingLeftButton = SwingButton(
        "swingLeft",
        "images/cricketBatLeft.png"
      );
      swingLeftButton.top = "-50px";
      swingLeftButton.left = "-100px";

      const swingRightButton = SwingButton(
        "swingRight",
        "images/cricketBatRight.png"
      );
      swingRightButton.top = "-50px";
      swingRightButton.left = "100px";

      advancedTexture.addControl(swingLeftButton);
      advancedTexture.addControl(swingRightButton);

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
