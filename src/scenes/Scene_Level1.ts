import {
  Engine,
  HemisphericLight,
  Mesh,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { PropSpawner } from "../interaction/PropSpawner";
import { NetworkManager } from "../networking/NetworkManager";
import { Player } from "../player/Player";
import { MeshInstancer, InteractableTypes } from "../utils/MeshInstancer";
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

    this.meshInstancer = new MeshInstancer("./models/", "Props.glb", this);
  }

  public async loadScene() {
    new HemisphericLight("light1", new Vector3(1, 1, 0), this);

    var levelGeo = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "Level_01.glb",
      this
    );

    let pathEnter: TransformNode[] = [];
    let pathExit: TransformNode[] = [];

    for (let i = 0; i < levelGeo.transformNodes.length; i++) {
      let t = levelGeo.transformNodes[i];

      if (t.name.includes("SpawnPoint")) {
        this.spawnPoints.push(t);
      } else if (t.name.includes("AI_Path_Enter")) {
        pathEnter.push(t);
      } else if (t.name.includes("AI_Path_Exit")) {
        pathExit.push(t);
      }
    }

    this.aiManager.setPaths(pathEnter, pathExit);

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

      let playerIndex = playerIds.indexOf(playerIds[i]);

      let spawnPoint = this.spawnPoints.find((s) =>
        s.name.includes(`_${playerIndex}`)
      );

      player.setPosition(spawnPoint.position.multiply(new Vector3(-1, -1, 1)));

      if (isLocal) {
        this.player = player;
      }
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
        let meshType = InteractableTypes[m.name.split("_")[1]];

        let spawner = new PropSpawner(meshType, m as Mesh, this);
      }
    }

    return this;
  }
}
