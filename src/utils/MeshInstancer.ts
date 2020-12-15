import { InstancedMesh, Mesh, SceneLoader } from "@babylonjs/core";
import { Interactable_Base } from "../interaction/interactable_base";
import { Needle } from "../interaction/Needle";
import { Syringe } from "../interaction/Syringe";
import { Syringe_Loaded } from "../interaction/Syringe_Loaded";
import { Tablet } from "../interaction/Tablet";
import { Vaccine } from "../interaction/Vaccine";
import { ISpawnInteractableData } from "../networking/messageTypes/Message_SpawnInteractable";
import { Scene_Base } from "../scenes/Scene_Base";


export enum InteractableTypes {
  Syringe,
  Needle,
  Tablet,
  VaccineA,
  Syringe_Needle,
  Syringe_Loaded
}

export class MeshInstancer {
  private scene: Scene_Base;
  private meshes: Mesh[];

  private objectId: number = 0;
  private objectMap = new Map<number, Interactable_Base>();

  constructor(filePath: string, fileName: string, scene: Scene_Base) {
    this.scene = scene;
    this.loadProps(filePath, fileName);

    this.scene.networkManager.onInteractableSpawnReceived.sub((d) =>
      this.spawnItem_Remote(d)
    );
  }

  //On the client the object Id will be passed in from the spawn event, the server counts itself
  public async getInteractable(
    interactableType: InteractableTypes,
    objectId: number = -1
  ): Promise<Interactable_Base> {
    let mesh = this.meshes
      .find((m) => m.name.includes(InteractableTypes[interactableType]))
      .instantiateHierarchy() as InstancedMesh;

    let interactable: Interactable_Base;

    //Object id from server
    let newObjectId = objectId === -1 ? this.objectId : objectId;

    switch (interactableType) {
      case InteractableTypes.Needle:
        interactable = new Needle(
          this.scene,
          newObjectId,
          this.scene.player,
          mesh
        );
        break;

      case InteractableTypes.Syringe:
        interactable = new Syringe(
          this.scene,
          newObjectId,
          this.scene.player,
          mesh
        );
        break;

      case InteractableTypes.Tablet:
        interactable = new Tablet(
          this.scene,
          newObjectId,
          this.scene.player,
          mesh
        );
        break;

      case InteractableTypes.VaccineA:
        interactable = new Vaccine(
          this.scene,
          newObjectId,
          this.scene.player,
          mesh
        );
        break;

      case InteractableTypes.Syringe_Needle:
        interactable = new Interactable_Base(
          this.scene,
          newObjectId,
          this.scene.player,
          mesh
        );
        break;

      case InteractableTypes.Syringe_Loaded:
        interactable = new Syringe_Loaded(
          this.scene,
          newObjectId,
          this.scene.player,
          mesh
        );
        break;
    }

    this.objectMap.set(newObjectId, interactable);
    this.objectId++;

    return interactable;
  }

  public getById(objectId: number): Interactable_Base {
    return this.objectMap.get(objectId);
  }

  private async spawnItem_Remote(data: ISpawnInteractableData) {
    let interactable = await this.getInteractable(
      data.interactbaleType,
      data.objectId
    );

    if (data.parentName) {
      interactable.mesh.setParent(this.scene.getNodeByName(data.parentName));
    } else {
      interactable.mesh.setParent(null);
    }

    if (data.position) {
      interactable.mesh.position = data.position;
    }

    if (data.rotation) {
      interactable.mesh.rotationQuaternion = data.rotation;
    }
  }

  private async loadProps(filePath: string, fileName: string) {
    let res = await SceneLoader.ImportMeshAsync("", filePath, fileName);

    res.meshes.forEach((m) => {
      m.isVisible = false;
    });

    this.meshes = res.meshes as Mesh[];
  }
}
