import { Mesh, PickingInfo, Quaternion, Scene, Vector3 } from "@babylonjs/core";
import { Player } from "../player/Player";
import { Interactable_Base } from "./interactable_base";

export class Vaccine extends Interactable_Base {
  constructor(scene: Scene, player: Player, mesh?: Mesh) {
    super(scene, player, mesh, true, false);
  }

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
