import { Quaternion, Vector3 } from "@babylonjs/core";
import { InteractableTypes } from "../../utils/MeshInstancer";
import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export interface ISpawnInteractableData {
  interactbaleType: InteractableTypes;
  objectId: number;
  parentName?: string;
  position?: Vector3;
  rotation?: Quaternion;
}

export interface ISpawnInteractableData_DTO {
  interactbaleType: InteractableTypes;
  objectId: number;
  parentName: string;
  position: number[];
  rotation: number[];
}

export class Message_SpawnInteractable implements INetworkMessage {
  type: NetworkMessageTypes;
  data: ISpawnInteractableData_DTO;

  constructor(data: ISpawnInteractableData) {
    this.type = NetworkMessageTypes.spawnInteractable;

    let position = [];
    if (data.position) {
      position = [data.position.x, data.position.y, data.position.z];
    }

    let rotation = [];
    if (data.rotation) {
      let rot = data.rotation;
      rotation = [rot.x, rot.y, rot.z, rot.w];
    }

    this.data = {
      interactbaleType: data.interactbaleType,
      objectId: data.objectId,
      parentName: data.parentName,
      position: position,
      rotation: rotation,
    };
  }
}
