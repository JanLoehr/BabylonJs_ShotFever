import { PickingInfo, Quaternion, Vector3 } from "@babylonjs/core";
import { Interactable_Base } from "./interactable_base";

export class Vaccine extends Interactable_Base {
  protected landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      this.mesh.setParent(
        pick.pickedMesh
          .getChildTransformNodes()
          .find((n) => n.name.includes("Anchor_Vaccine"))
      );

      this.mesh.position = Vector3.Zero();
      this.mesh.rotationQuaternion = Quaternion.Identity();

      this.removefromPlayerInteractables();
      this.mesh.isPickable = false;
    } else {
      super.landItem(pick);
    }
  }
}
