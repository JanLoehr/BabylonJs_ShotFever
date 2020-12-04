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
import { SceneManager } from "./SceneManager";
import { Scene_Base } from "./Scene_Base";

export class Scene_Level1 extends Scene_Base {
  constructor(
    engine: Engine,
    networkManager: NetworkManager,
    sceneManager: SceneManager,
    canvas: HTMLCanvasElement
  ) {
    super(engine, networkManager, sceneManager, canvas);

    this.meshInstancer = new MeshInstancer("./models/", "Props.glb");
  }

  public async loadScene() {
    new HemisphericLight("light1", new Vector3(1, 1, 0), this);

    var levelGeo = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "Level_01.glb",
      this
    );

    for (let i = 0; i < levelGeo.transformNodes.length; i++) {
      let t = levelGeo.transformNodes[i];

      if (t.name.includes("SpawnPoint")) {
        this.spawnPoints.push(t);
      }
    }

    let playerIds: string[] = [];
    let playerNames: string[] = [];

    this.networkManager.players.forEach((v, k) => {
      playerIds.push(k);
      playerNames.push(v);
    });

    for (let i = 0; i < playerIds.length; i++) {
      let isLocal = this.networkManager.isLocalPlayer(playerIds[i]);
      let player = new Player(
        this,
        this.canvas,
        isLocal,
        playerIds[i],
        playerNames[i]
      );
      await player.loadPlayer(this);

      if (isLocal) {
        this.player = player;
      }

      let playerIndex = this.networkManager.getPlayerIndex(playerIds[i]);

      let spawnPoint = this.spawnPoints.find((s) =>
        s.name.includes(`_${playerIndex}`)
      );

      player.setPosition(spawnPoint.position);
    }

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
