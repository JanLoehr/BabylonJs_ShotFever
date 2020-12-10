import {
  InstancedMesh,
  Mesh,
  PickingInfo,
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { OnPickBehavior } from "../behaviors/onPickBehavior";
import { Player } from "../player/Player";
import { Scene_Base } from "../scenes/Scene_Base";
import { Interactable_Base } from "./interactable_base";

export class Needle extends Interactable_Base {
  constructor(
    scene: Scene_Base,
    objectId: number,
    player: Player,
    mesh?: InstancedMesh
  ) {
    super(scene, objectId, player, mesh, true, false);
  }

  protected async landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      (pick.pickedMesh.getBehaviorByName(
        "onPickBehavior"
      ) as OnPickBehavior).onPick.dispatch(this, "Needle");
    } else {
      super.landItem(pick);
    }
  }

  public setSocket(node: TransformNode) {
    if (node) {
      this.removefromPlayerInteractables();
      this.mesh.isPickable = false;

      this.mesh.setParent(node);
      this.mesh.position = Vector3.Zero();
      this.mesh.rotationQuaternion = Quaternion.Identity();
    }
  }
}
