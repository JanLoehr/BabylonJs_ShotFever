import {
  Color3,
  InstancedMesh,
  Mesh,
  PickingInfo,
  Quaternion,
  Ray,
  RayHelper,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { OnPickBehavior } from "../behaviors/onPickBehavior";
import { Message_InteractableEvent } from "../networking/messageTypes/Message_InteractableEvent";
import { Player } from "../player/Player";
import { Scene_Base } from "../scenes/Scene_Base";
import { InteractableTypes } from "../utils/MeshInstancer";
import { Interactable_Base } from "./interactable_base";

export class Syringe_Loaded extends Interactable_Base {
  private rayAnchor: TransformNode;
  private hasShot: boolean = false;

  constructor(
    scene: Scene_Base,
    objectId: number,
    player: Player,
    mesh?: InstancedMesh
  ) {
    super(scene, objectId, player, mesh, true, false);

    this.rayAnchor = mesh.getChildTransformNodes(true, (t) =>
      t.name.includes("Ray_Anchor")
    )[0];

    console.log(this.rayAnchor);
  }

  protected update(deltaTime: number) {
    super.update(deltaTime);

    if (this.pickedUp && !this.hasShot) {
      let ray = new Ray(
        this.rayAnchor.absolutePosition,
        this.rayAnchor.forward,
        0.3
      );

      let pick = this.scene.pickWithRay(
        ray,
        (m) => m.isPickable && m != this.mesh
      );

      if (pick.hit) {
        let behavior = pick.pickedMesh.getBehaviorByName(
          "onPickBehavior"
        ) as OnPickBehavior;

        if (
          behavior &&
          (behavior.meshOwner as Player) != null &&
          this.interactingPlayer.isLocalPlayer
        ) {
          behavior.onPick.dispatch(this, "vaccinated");

          this.vaccinated(true);

          this.scene.networkManager.send(
            new Message_InteractableEvent({
              objectId: this.objectId,
              eventName: "vaccinated",
            })
          );
        }
      }
    }
  }

  public onInteractableEvent(eventName: string) {
    console.log("oninteractableevent:", eventName);
    if (eventName === "vaccinated") {
      console.log("remote vaccinated");
      this.vaccinated(false);
    }
  }

  private async vaccinated(local: boolean) {
    this.hasShot = true;

    let emptyNeedle = await this.scene.meshInstancer.getInteractable(
      InteractableTypes.Syringe_Needle
    );

    emptyNeedle.mesh.setParent(this.mesh.parent);
    emptyNeedle.mesh.position = this.mesh.position;
    emptyNeedle.mesh.rotationQuaternion = this.mesh.rotationQuaternion;

    if (local) {
      this.interactingPlayer.forcePickup(emptyNeedle);
    }
    
    this.removefromPlayerInteractables();

    this.mesh.dispose();
  }
}
