import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { Player } from "../player/Player";
import { Scene_Base } from "./Scene_Base";

export class Scene_Level1 extends Scene_Base {
  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine, canvas);

    this.setupScene();
  }

  public update() {
    super.update();

    this.player.update(this.deltaTime);
  }

  public render() {
    this.scene.render();
  }

  private async setupScene() {
    this.player = new Player(this.scene, this.canvas);

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
    levelGeo.meshes.forEach((m) => (m.checkCollisions = true));
  }
}
