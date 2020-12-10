import {
  BouncingBehavior,
  FadeInOutBehavior,
  InstancedMesh,
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { OnPickBehavior } from "../behaviors/onPickBehavior";
import { Message_SpawnInteractable } from "../networking/messageTypes/Message_SpawnInteractable";
import { Player } from "../player/Player";
import { Scene_Base } from "../scenes/Scene_Base";
import { ProgressBar } from "../ui/ProgressBar";
import { InteractableTypes } from "../utils/MeshInstancer";
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

  private guiPlane: Mesh;
  private progressBar: ProgressBar;
  private guiTexture: AdvancedDynamicTexture;

  constructor(
    scene: Scene_Base,
    objectId: number,
    player: Player,
    mesh?: InstancedMesh
  ) {
    super(scene, objectId, player, mesh, true, false);

    let onPickBehavior = new OnPickBehavior();
    onPickBehavior.onPick.subscribe((sender, args) => {
      this.onPick(sender, args);
    });

    this.mesh.addBehavior(onPickBehavior);

    this.needleAnchor = this.mesh
      .getChildTransformNodes()
      .find((t) => t.name.includes("Anchor_Needle"));

    this.vaccineAnchor = this.mesh
      .getChildTransformNodes()
      .find((t) => t.name.includes("Anchor_Vaccine"));
  }

  protected update(deltaTime: number) {
    super.update(deltaTime);

    if (this.isUsing && this.progressBar) {
      let seconds = 2;
      let value = (Date.now() - this.usingStarted) / 1000 / seconds;
      this.progressBar.setValue(value);

      if (value > 1) {
        this.guiPlane.dispose();
        this.guiTexture.dispose();
        this.progressBar = null;

        this.switchToSyringeNeedle();
      }
    }
  }

  public startUse(): boolean {
    let using = super.startUse();

    if (using) {
      this.finishedSyringe.mesh.setParent(this.droppedVaccine.needleSocket);
      this.finishedSyringe.mesh.position = Vector3.Zero();
      this.finishedSyringe.mesh.rotationQuaternion = Quaternion.Identity();

      let plane = MeshBuilder.CreatePlane("ProgressGUI", {});
      plane.setParent(this.mesh);
      plane.position = new Vector3(0, 1.5, 0);

      this.guiTexture = AdvancedDynamicTexture.CreateForMesh(plane);

      this.progressBar = new ProgressBar(this.guiTexture);

      this.guiPlane = plane;
    }

    return using;
  }

  public stopUse(): boolean {
    let stopped = super.stopUse();

    if (stopped) {
      this.guiPlane.dispose();
      this.guiTexture.dispose();
    }
    return stopped;
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

    if (this.syringeFinished && this.vaccineSet) {
      this.canUse = true;
    }
  }

  private async switchToSyringeNeedle() {
    if (this.scene.networkManager.isHost) {
      let syringe = await this.scene.meshInstancer.getInteractable(
        InteractableTypes.Syringe_Needle
      );

      syringe.mesh.setParent(null);
      syringe.mesh.position = this.mesh.position;

      this.scene.networkManager.send(
        new Message_SpawnInteractable({
          interactbaleType: InteractableTypes.Syringe_Needle,
          objectId: syringe.objectId,
          parentName: null,
          position: syringe.mesh.position,
          rotation: syringe.mesh.rotationQuaternion,
        })
      );
    }

    this.removefromPlayerInteractables();
    this.mesh.dispose();
  }

  private async addFinishedSyringe() {
    this.finishedSyringe = await this.scene.meshInstancer.getInteractable(
      InteractableTypes.Syringe_Needle
    );

    this.droppedNeedle.mesh.dispose();
    this.droppedSyringe.mesh.dispose();

    this.finishedSyringe.canPickup = false;
    this.finishedSyringe.canUse = false;

    this.scene.player.removeInteractable(this.finishedSyringe);

    this.finishedSyringe.mesh.setParent(this.needleAnchor);
    this.finishedSyringe.mesh.position = Vector3.Zero();
    this.finishedSyringe.mesh.rotationQuaternion = Quaternion.Identity();
  }
}
