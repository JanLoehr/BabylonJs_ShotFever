import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine } from "@babylonjs/core";
import { SceneKeys, SceneManager } from "./scenes/SceneManager";

class App {
  private canvas: HTMLCanvasElement = undefined;
  private engine: Engine;
  private sceneManager: SceneManager;

  constructor() {
    // create the canvas html element and attach it to the webpage
    this.canvas = this._createCanvas();

    // initialize babylon scene and engine
    this.engine = new Engine(this.canvas, true);
    this.sceneManager = new SceneManager(this.engine, this.canvas);

    this.sceneManager.loadScene(SceneKeys.Scene_One);

    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.sceneManager.renderCurrentScene();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private _createCanvas(): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;

    //Commented out for development
    document.documentElement.style["overflow"] = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    //create the canvas html element and attach it to the webpage
    canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";

    document.body.appendChild(canvas);

    return canvas;
  }
}

new App();
