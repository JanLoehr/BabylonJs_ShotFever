import { Engine, Scene } from "@babylonjs/core";
import { Scene_Base } from "./Scene_Base";
import { Scene_Level1 } from "./Scene_Level1";

export enum SceneKeys {
  Menu,
  Scene_One,
}

export class SceneManager {
  private scenes: { [sceneType: number]: Scene_Base } = {};

  private currentScene: Scene_Base;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.scenes[SceneKeys.Menu] = new Scene_Base(engine, canvas);
    this.scenes[SceneKeys.Scene_One] = new Scene_Level1(engine, canvas);
  }

  public async loadScene(sceneKey: SceneKeys) {
    this.currentScene = await this.scenes[sceneKey].loadScene();
  }

  public renderCurrentScene() {
    if (this.currentScene) {
      this.currentScene.render();
    }
  }
}
