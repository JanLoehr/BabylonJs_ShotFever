import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine } from "@babylonjs/core";
import { Scene_Level1 } from "./scenes/Scene_Level1";

class App {
  private canvas: HTMLCanvasElement = undefined;

  constructor() {
    // create the canvas html element and attach it to the webpage
    this.canvas = this._createCanvas();

    // initialize babylon scene and engine
    var engine = new Engine(this.canvas, true);
    var scene = new Scene_Level1(engine, this.canvas);

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === "I") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.update();
      scene.render();
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
