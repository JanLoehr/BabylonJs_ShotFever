import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export interface IInteractableEventData {
  objectId: number;
  eventName: string;
}

export class Message_InteractableEvent implements INetworkMessage {
  type: NetworkMessageTypes;
  data: IInteractableEventData;

  constructor(data: IInteractableEventData) {
    this.type = NetworkMessageTypes.interactableEvent;
    this.data = data;
  }
}
