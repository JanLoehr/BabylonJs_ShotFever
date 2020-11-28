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
import { Interactable_Base } from "../interaction/interactable_base";
import { Player } from "../player/Player";
import { Scene_Base } from "./Scene_Base";

export class Scene_Level1 extends Scene_Base {
  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine, canvas);
  }

  protected update(deltaTime: number) {}

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

    let syringe = new Interactable_Base(this.scene, this.player);
    await syringe.loadAssets("Syringe");
    syringe.mesh.position = new Vector3(2, 1, 0);
    syringe.mesh.rotationQuaternion = new Vector3(
      0,
      Math.PI / 2,
      0
    ).toQuaternion();

    let tablet = new Interactable_Base(this.scene, this.player);
    await tablet.loadAssets("Tablet");
    tablet.mesh.position = new Vector3(2, 1, 1);
    tablet.mesh.rotationQuaternion = new Vector3(
      0,
      Math.PI / 2,
      0
    ).toQuaternion();

    let vaccine = new Interactable_Base(this.scene, this.player);
    await vaccine.loadAssets("Vaccine_A");
    vaccine.mesh.position = new Vector3(2, 1, 2);
    vaccine.mesh.rotationQuaternion = new Vector3(
      0,
      Math.PI / 2,
      0
    ).toQuaternion();

    let needle = new Interactable_Base(this.scene, this.player);
    await needle.loadAssets("Needle");
    needle.mesh.position = new Vector3(2, 1, -1);
    needle.mesh.rotationQuaternion = new Vector3(
      0,
      Math.PI / 2,
      0
    ).toQuaternion();

    return this;
  }
}
