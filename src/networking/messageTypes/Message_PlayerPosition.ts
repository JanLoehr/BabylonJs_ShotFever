import { Vector3 } from "@babylonjs/core";
import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export class Message_PlayerPosition implements INetworkMessage {
  type: NetworkMessageTypes;
  data: number[];

  constructor(playerPosition: Vector3) {
    this.type = NetworkMessageTypes.playerPosition;

    let position: number[] = [
      playerPosition.x,
      playerPosition.y,
      playerPosition.z,
    ];

    this.data = position;
  }
}
