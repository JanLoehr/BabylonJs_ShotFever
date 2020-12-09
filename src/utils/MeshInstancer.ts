import { InstancedMesh, Mesh, SceneLoader } from "@babylonjs/core";
import { Interactable_Base } from "../interaction/interactable_base";
import { Needle } from "../interaction/Needle";
import { Syringe } from "../interaction/Syringe";
import { Tablet } from "../interaction/Tablet";
import { Vaccine } from "../interaction/Vaccine";
import { Scene_Base } from "../scenes/Scene_Base";

export enum InteractableTypes {
  Syringe,
  Needle,
  Tablet,
  VaccineA,
  Syringe_Needle,
}

export class MeshInstancer {
  private scene: Scene_Base;
  private meshes: Mesh[];

  private objectId: number = 0;
  private objectMap = new Map<number, Interactable_Base>();

  constructor(filePath: string, fileName: string, scene: Scene_Base) {
    this.scene = scene;
    this.loadProps(filePath, fileName);
  }

  public async getInteractable(
    interactableType: InteractableTypes
  ): Promise<Interactable_Base> {
    let mesh = this.meshes
      .find((m) => m.name.includes(InteractableTypes[interactableType]))
      .instantiateHierarchy() as InstancedMesh;

    let interactable: Interactable_Base;

    switch (interactableType) {
      case InteractableTypes.Needle:
        interactable = new Needle(
          this.scene,
          this.scene.player,
          this.objectId,
          mesh
        );
        break;

      case InteractableTypes.Syringe:
        interactable = new Syringe(
          this.scene,
          this.scene.player,
          this.objectId,
          mesh
        );
        break;

      case InteractableTypes.Tablet:
        interactable = new Tablet(
          this.scene,
          this.scene.player,
          this.objectId,
          mesh
        );
        break;

      case InteractableTypes.VaccineA:
        interactable = new Vaccine(
          this.scene,
          this.scene.player,
          this.objectId,
          mesh
        );
        break;
    }

    this.objectMap.set(this.objectId, interactable);
    this.objectId++;

    return interactable;
  }

  public getById(objectId: number): Interactable_Base {
    return this.objectMap.get(objectId);
  }

  private async loadProps(filePath: string, fileName: string) {
    let res = await SceneLoader.ImportMeshAsync("", filePath, fileName);

    res.meshes.forEach((m) => {
      m.isVisible = false;
    });

    this.meshes = res.meshes as Mesh[];
  }
}
