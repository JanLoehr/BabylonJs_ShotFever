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
import { Needle } from "../interaction/Needle";
import { Syringe } from "../interaction/Syringe";
import { Tablet } from "../interaction/Tablet";
import { Vaccine } from "../interaction/Vaccine";
import { Player } from "../player/Player";
import { MeshTypes } from "../utils/MeshInstancer";
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

    levelGeo.meshes.forEach(async (m) => {
      if (m.name.includes("Collision")) {
        m.checkCollisions = true;
      }

      if (m.name.includes("Invisible")) {
        m.isVisible = false;
      }

      if (m.name.includes("Spawner_")) {
        let meshType = MeshTypes[m.name.split("_")[1]];

        let mesh = await this.meshInstancer.getMeshInstance(meshType);

        mesh.setParent(m);
        mesh.position = new Vector3(0, 1, 0);
      }
    });
    
    let mesh = await this.meshInstancer.getMeshInstance(MeshTypes.Tablet);
    mesh.setParent(null);
    mesh.position = new Vector3(0, 3, 0);
    return this;
  }
}
