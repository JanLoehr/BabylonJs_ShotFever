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
import { Interactable_Base } from "./interactable_base";

export class Vaccine extends Interactable_Base {
  public needleSocket: TransformNode;

  constructor(
    scene: Scene,
    player: Player,
    objectId: number,
    mesh?: InstancedMesh
  ) {
    super(scene, objectId, player, mesh, true, false);

    this.needleSocket = mesh
      .getChildTransformNodes()
      .find((t) => t.name.includes("Anchor_Needle"));
  }

  protected landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      (pick.pickedMesh.getBehaviorByName(
        "onPickBehavior"
      ) as OnPickBehavior).onPick.dispatch(this, "Vaccine");
    } else {
      super.landItem(pick);
    }
  }

  public setSocket(socket: TransformNode) {
    this.mesh.setParent(socket);

    this.mesh.position = Vector3.Zero();
    this.mesh.rotationQuaternion = Quaternion.Identity();

    this.removefromPlayerInteractables();
    this.mesh.isPickable = false;
  }
}
