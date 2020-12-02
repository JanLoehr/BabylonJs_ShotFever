import { Mesh, Vector3 } from "@babylonjs/core";
import { Scene_Base } from "../scenes/Scene_Base";
import { MeshInstancer, MeshTypes } from "../utils/MeshInstancer";
import { Interactable_Base } from "./interactable_base";
import { Needle } from "./Needle";
import { Syringe } from "./Syringe";
import { Tablet } from "./Tablet";
import { Vaccine } from "./Vaccine";

export class PropSpawner {
  private propType: MeshTypes;
  private mesh: Mesh;
  private scene: Scene_Base;

  private currentInteractable: Interactable_Base;

  constructor(propType: MeshTypes, mesh: Mesh, scene: Scene_Base) {
    this.propType = propType;
    this.mesh = mesh;
    this.scene = scene;

    this.spawnProp();
  }

  private async spawnProp() {
    let mesh = (await this.scene.meshInstancer.getMeshInstance(
      this.propType
    )) as Mesh;

    let interacteble: Interactable_Base;

    switch (this.propType) {
      case MeshTypes.Needle:
        interacteble = new Needle(this.scene, this.scene.player, mesh);
        break;

      case MeshTypes.Syringe:
        interacteble = new Syringe(this.scene, this.scene.player, mesh);
        break;

      case MeshTypes.Tablet:
        interacteble = new Tablet(this.scene, this.scene.player, mesh);
        break;

      case MeshTypes.VaccineA:
        interacteble = new Vaccine(this.scene, this.scene.player, mesh);
        break;
    }

    interacteble.mesh.setParent(this.mesh);
    interacteble.mesh.position = new Vector3(0, 1, 0);

    interacteble.onPickup.one(() => this.onPickupProp());
    this.currentInteractable = interacteble;
  }

  private onPickupProp() {
    this.currentInteractable = null;

    setTimeout(() => this.spawnProp(), 5000);
  }
}
