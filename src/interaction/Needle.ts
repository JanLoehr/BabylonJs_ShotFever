import { Mesh, PickingInfo, Quaternion, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { Player } from "../player/Player";
import { CustomMesh } from "../utils/CustomMesh";
import { Interactable_Base } from "./interactable_base";

export class Needle extends Interactable_Base {
  constructor(scene: Scene, player: Player, mesh?: Mesh) {
    super(scene, player, mesh, true, false);
  }

  protected async landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      (pick.pickedMesh as CustomMesh).onPick.dispatch(this, "Needle");
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
