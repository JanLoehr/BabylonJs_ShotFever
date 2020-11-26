import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { subSurfaceScatteringFunctions } from "@babylonjs/core/Shaders/ShadersInclude/subSurfaceScatteringFunctions";
import { Player } from "../player/Player";
import { Scene_Base } from "./Scene_Base";

export class Scene_Level1 extends Scene_Base {
  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine, canvas);
  }

  public update() {
    super.update();

    this.player.update(this.deltaTime);
  }

  public render() {
    this.scene.render();
  }

  public async loadScene() {
    this.player = new Player(this.scene, this.canvas);
    await this.player.loadPlayer(this.scene);

    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this.scene
    );

    var levelGeo = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "Level_01.glb"
    );

    levelGeo.meshes.forEach((m) => {
      if (m.name.includes("Collision")) {
        m.checkCollisions = true;
      }

      if (m.name.includes("Invisible")) {
        m.isVisible = false;
      }
    });

    return this;
  }
}
