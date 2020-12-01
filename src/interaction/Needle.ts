import { Mesh, PickingInfo, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { Player } from "../player/Player";
import { CustomMesh } from "../utils/CustomMesh";
import { Interactable_Base } from "./interactable_base";

export class Needle extends Interactable_Base {
  constructor(scene: Scene, player: Player, mesh?: Mesh) {
    super(scene, player, mesh, true, false);
  }
  
  protected async landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      let anchor = pick.pickedMesh
        .getChildTransformNodes()
        .find((n) => n.name.includes("Anchor_Needle"));

      this.removefromPlayerInteractables();
      this.mesh.isPickable = false;

      if (anchor.getChildMeshes().length > 0) {
        this.mesh.setParent(anchor);
        (pick.pickedMesh as CustomMesh).onPick.dispatch("NeedleFinished");
      } else {
        this.mesh.setParent(anchor);
        this.mesh.position = Vector3.Zero();
        this.mesh.rotationQuaternion = Quaternion.Identity();
      }

      // pick.pickedMesh.
    } else {
      super.landItem(pick);
    }
  }
}
