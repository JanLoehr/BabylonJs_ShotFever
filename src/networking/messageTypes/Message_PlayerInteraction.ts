import { Vector3 } from "@babylonjs/core";
import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export enum InteractionTypes {
  useSart,
  useStop,
  pickup,
  drop,
}

export interface IPlayerInteractionData {
  interactionType: InteractionTypes;
  objectId: number;
  position?: Vector3;
}

export interface IPlayerInteractionData_DTO {
  interactionType: InteractionTypes;
  objectId: number;
  position: number[];
}

export class Message_PlayerInteraction implements INetworkMessage {
  type: NetworkMessageTypes;
  data: IPlayerInteractionData_DTO;

  constructor(data: IPlayerInteractionData) {
    this.type = NetworkMessageTypes.playerInteraction;

    let position = [];
    if (data.position) {
      position = [data.position.x, data.position.y, data.position.z];
    }

    this.data = {
      interactionType: data.interactionType,
      objectId: data.objectId,
      position: position,
    };
  }
}
