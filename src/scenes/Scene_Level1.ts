import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Vector3 } from "@babylonjs/core";
import { subSurfaceScatteringFunctions } from "@babylonjs/core/Shaders/ShadersInclude/subSurfaceScatteringFunctions";
import { Scene_Base } from "./Scene_Base";

export class Scene_Level1 extends Scene_Base {
  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine, canvas);

    this.setupScene();
  }

  public render() {
    this.scene.render();
  }

  private setupScene() {
    var camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(this.canvas, true);
    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this.scene
    );
    var sphere: Mesh = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      this.scene
    );
  }
}
