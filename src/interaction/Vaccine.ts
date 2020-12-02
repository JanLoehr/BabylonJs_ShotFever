import {
  Mesh,
  PickingInfo,
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Player } from "../player/Player";
import { CustomMesh } from "../utils/CustomMesh";
import { Interactable_Base } from "./interactable_base";

export class Vaccine extends Interactable_Base {
  public needleSocket: TransformNode;

  constructor(scene: Scene, player: Player, mesh?: Mesh) {
    super(scene, player, mesh, true, false);

    this.needleSocket = mesh
      .getChildTransformNodes()
      .find((t) => t.name.includes("Anchor_Needle"));
  }

  protected landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      (pick.pickedMesh as CustomMesh).onPick.dispatch(this, "Vaccine");
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
