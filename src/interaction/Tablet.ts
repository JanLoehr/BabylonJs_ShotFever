import { Mesh, Quaternion, Scene, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import { Player } from "../player/Player";
import { MeshTypes } from "../utils/MeshInstancer";
import { Interactable_Base } from "./interactable_base";

export class Tablet extends Interactable_Base {
  constructor(scene: Scene, player: Player, mesh?: Mesh) {
    super(scene, player, mesh, true, false);

    this.canDrop = true;

    this.mesh.onPick.subscribe((msg) => {
      this.onPick(msg);
    });
  }

  public onPick(message: string) {
    if (message.includes("NeedleFinished")) {
      this.addFinishedSyringe();
    }
  }

  private async addFinishedSyringe() {
    let anchor = this.mesh
      .getChildTransformNodes()
      .find((a) => a.name.includes("Anchor_Needle"));

    anchor.getChildMeshes().forEach((m) => m.dispose());

    let needle = new Interactable_Base(this.scene, this.player, null, false, false);
    await needle.loadAssets(MeshTypes.Syringe_Needle);

    needle.mesh.setParent(anchor);
    needle.mesh.position = Vector3.Zero();
    needle.mesh.rotationQuaternion = Quaternion.Identity();

    this.canUse = true;
  }
}
