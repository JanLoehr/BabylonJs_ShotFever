import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export interface IAiEventData {
  aiId: number;
  eventName: string;
  data: string;
}

export class Message_AiEvent implements INetworkMessage {
  type: NetworkMessageTypes;
  data: IAiEventData;

  constructor(data: IAiEventData) {
    this.type = NetworkMessageTypes.aiEvent;
    this.data = data;
  }
}
