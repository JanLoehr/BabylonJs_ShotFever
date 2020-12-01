import { Engine, Scene } from "@babylonjs/core";
import { Scene_Base } from "./Scene_Base";
import { Scene_Level1 } from "./Scene_Level1";

export enum SceneKeys {
  Menu,
  Scene_One,
}

export class SceneManager {
  private engine: Engine;
  private scenes: { [sceneType: number]: Scene_Base } = {};

  private currentScene: Scene_Base;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.engine = engine;

    // this.scenes[SceneKeys.Menu] = new Scene_Base(engine, canvas);
    this.scenes[SceneKeys.Scene_One] = new Scene_Level1(engine, canvas);

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === "I") {
        if (this.currentScene.debugLayer.isVisible()) {
          this.currentScene.debugLayer.hide();
        } else {
          this.currentScene.debugLayer.show();
        }
      }
    });
  }

  public async loadScene(sceneKey: SceneKeys) {
    if (this.currentScene) {
      this.currentScene.onBeforeRenderObservable.clear();
      this.currentScene.unload();
    }

    this.currentScene = await this.scenes[sceneKey].loadScene();

    this.currentScene.onBeforeRenderObservable.add(this.updateCurrentScene);
  }

  private updateCurrentScene() {
    if (this.currentScene) {
      this.currentScene.update(this.engine.getDeltaTime() / 1000);
    }
  }

  public renderCurrentScene() {
    if (this.currentScene) {
      this.currentScene.render();
    }
  }
}
