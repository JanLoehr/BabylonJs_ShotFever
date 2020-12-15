import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export interface IPlayerEventData {
  playerId: string;
  eventName: string;
}

export class Message_PlayerEvent implements INetworkMessage {
  type: NetworkMessageTypes;
  data: IPlayerEventData;

  constructor(data: IPlayerEventData) {
    this.type = NetworkMessageTypes.playerEvent;
    this.data = data;
  }
}
