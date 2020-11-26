import {
  Action,
  ActionManager,
  ExecuteCodeAction,
  Mesh,
  MeshBuilder,
  Scene,
} from "@babylonjs/core";
import { Player } from "../player/Player";

export class Interactable_Base {
  public mesh: Mesh;

  constructor(scene: Scene, player: Player) {
    this.mesh = MeshBuilder.CreateBox("interactable", { size: 0.5 }, scene);

    this.mesh.actionManager = new ActionManager(scene);

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: player.interactor,
        },
        (e) => {
          player.addInteractable(this);
        }
      )
    );

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: player.interactor,
        },
        (e) => {
          player.removeInteractable(this);
        }
      )
    );
  }
}
