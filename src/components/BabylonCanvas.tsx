import React, { useEffect, useRef } from "react";
import "@babylonjs/loaders";

import {
  Vector3,
  HemisphericLight,
  Scene,
  Engine,
  FreeCamera,
  SceneLoader,
  ArcRotateCamera,
} from "@babylonjs/core";

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
      camera.upperBetaLimit = Math.PI / 2 - .02;

      // Light
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

      // light.intensity = 0.7;

      const mesh = SceneLoader.ImportMeshAsync(
        "",
        "scenes/",
        "cricket_stadium.glb"
      );

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
        touchAction: "none", // Prevents default touch actions for better control
      }}
    />
  );
};

export default BabylonCanvas;
