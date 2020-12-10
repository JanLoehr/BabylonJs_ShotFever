import { InstancedMesh, Mesh, Quaternion, Vector3 } from "@babylonjs/core";
import { Message_SpawnInteractable } from "../networking/messageTypes/Message_SpawnInteractable";
import { Scene_Base } from "../scenes/Scene_Base";
import { MeshInstancer, InteractableTypes } from "../utils/MeshInstancer";
import { Interactable_Base } from "./interactable_base";
import { Needle } from "./Needle";
import { Syringe } from "./Syringe";
import { Tablet } from "./Tablet";
import { Vaccine } from "./Vaccine";

export class PropSpawner {
  private propType: InteractableTypes;
  private mesh: Mesh;
  private scene: Scene_Base;

  private currentInteractable: Interactable_Base;

  constructor(propType: InteractableTypes, mesh: Mesh, scene: Scene_Base) {
    this.propType = propType;
    this.mesh = mesh;
    this.scene = scene;

    this.spawnProp();
  }

  private async spawnProp() {
    if (!this.scene.networkManager.isHost) {
      return;
    }

    let interacteble = await this.scene.meshInstancer.getInteractable(
      this.propType
    );

    interacteble.mesh.setParent(this.mesh);
    interacteble.mesh.position = new Vector3(0, 1, 0);

    this.scene.networkManager.send(
      new Message_SpawnInteractable({
        interactbaleType: this.propType,
        objectId: interacteble.objectId,
        parentName: this.mesh.name,
        position: new Vector3(0, 1, 0),
      })
    );

    interacteble.onPickup.one(() => this.onPickupProp());
    this.currentInteractable = interacteble;
  }

  private onPickupProp() {
    this.currentInteractable = null;

    setTimeout(() => this.spawnProp(), 5000);
  }
}
