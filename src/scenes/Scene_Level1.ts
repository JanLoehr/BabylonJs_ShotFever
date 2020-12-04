import {
  Engine,
  HemisphericLight,
  Mesh,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { PropSpawner } from "../interaction/PropSpawner";
import { NetworkManager } from "../networking/NetworkManager";
import { Player } from "../player/Player";
import { MeshInstancer, MeshTypes } from "../utils/MeshInstancer";
import { Scene_Base } from "./Scene_Base";

export class Scene_Level1 extends Scene_Base {
  constructor(
    engine: Engine,
    networkManager: NetworkManager,
    canvas: HTMLCanvasElement
  ) {
    super(engine, networkManager, canvas);

    this.meshInstancer = new MeshInstancer("./models/", "Props.glb");
  }

  public update(deltaTime: number) {}

  public render() {
    super.render();
  }

  public async loadScene() {
    this.player = new Player(this, this.canvas);
    await this.player.loadPlayer(this);

    new HemisphericLight("light1", new Vector3(1, 1, 0), this);

    var levelGeo = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "Level_01.glb",
      this
    );

    for (let i = 0; i < levelGeo.meshes.length; i++) {
      let m = levelGeo.meshes[i];

      if (m.name.includes("Collision")) {
        m.checkCollisions = true;
      }

      if (m.name.includes("Invisible")) {
        m.isVisible = false;
      }

      if (m.name.includes("Spawner_")) {
        let meshType = MeshTypes[m.name.split("_")[1]];

        let spawner = new PropSpawner(meshType, m as Mesh, this);
      }
    }

    return this;
  }
}
