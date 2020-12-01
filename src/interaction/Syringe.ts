import {
  Mesh,
  PickingInfo,
  Quaternion,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { CustomMesh } from "../utils/CusomMesh";
import { Interactable_Base } from "./interactable_base";

export class Syringe extends Interactable_Base {
  protected async landItem(pick: PickingInfo) {
    if (pick.pickedMesh.name.includes("Tablet")) {
      console.log(pick.pickedMesh);
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
    } else {
      super.landItem(pick);
    }
  }
}
