import {
  Mesh,
  Quaternion,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Player } from "../player/Player";
import { MeshTypes } from "../utils/MeshInstancer";
import { Interactable_Base } from "./interactable_base";
import { Needle } from "./Needle";
import { Syringe } from "./Syringe";
import { Vaccine } from "./Vaccine";

export class Tablet extends Interactable_Base {
  private needleAnchor: TransformNode;
  private vaccineAnchor: TransformNode;

  private finishedSyringe: Interactable_Base;
  private droppedVaccine: Vaccine;
  private droppedNeedle: Needle;
  private droppedSyringe: Syringe;

  private needleSet: boolean = false;
  private syringeSet: boolean = false;
  private syringeFinished: boolean = false;
  private vaccineSet: boolean = false;

  constructor(scene: Scene, player: Player, mesh?: Mesh) {
    super(scene, player, mesh, true, false);

    this.canDrop = true;

    this.mesh.onPick.subscribe((sender, args) => {
      this.onPick(sender, args);
    });

    this.needleAnchor = this.mesh
      .getChildTransformNodes()
      .find((t) => t.name.includes("Anchor_Needle"));

    this.vaccineAnchor = this.mesh
      .getChildTransformNodes()
      .find((t) => t.name.includes("Anchor_Vaccine"));
  }

  protected update(deltaTime: number) {
    super.update(deltaTime);

    if (this.isUsing) {
    }
  }

  public startUse(): boolean {
    let using = super.startUse();

    if (using) {
      this.finishedSyringe.mesh.setParent(this.droppedVaccine.needleSocket);
      this.finishedSyringe.mesh.position = Vector3.Zero();
      this.finishedSyringe.mesh.rotationQuaternion = Quaternion.Identity();
      console.log(this.finishedSyringe);
    }

    return using;
  }

  private onPick(sender: any, args: any) {
    if (args === "Syringe" && !this.syringeSet) {
      this.droppedSyringe = sender as Syringe;
      this.droppedSyringe.setSocket(this.needleAnchor);

      this.syringeSet = true;
    } else if (args === "Needle" && !this.needleSet) {
      this.droppedNeedle = sender as Needle;
      this.droppedNeedle.setSocket(this.needleAnchor);

      this.needleSet = true;
    } else if (args === "Vaccine" && !this.vaccineSet) {
      this.droppedVaccine = sender as Vaccine;
      this.droppedVaccine.setSocket(this.vaccineAnchor);
      
      this.vaccineSet = true;
    }

    if (!this.syringeFinished && this.syringeSet && this.needleSet) {
      this.syringeFinished = true;

      this.addFinishedSyringe();
    }
  }

  private async addFinishedSyringe() {
    this.finishedSyringe = new Interactable_Base(
      this.scene,
      this.player,
      null,
      false,
      false
    );
    await this.finishedSyringe.loadAssets(MeshTypes.Syringe_Needle);

    this.droppedNeedle.mesh.dispose();
    this.droppedSyringe.mesh.dispose();

    this.finishedSyringe.mesh.setParent(this.needleAnchor);
    this.finishedSyringe.mesh.position = Vector3.Zero();
    this.finishedSyringe.mesh.rotationQuaternion = Quaternion.Identity();

    this.canUse = true;
  }
}
