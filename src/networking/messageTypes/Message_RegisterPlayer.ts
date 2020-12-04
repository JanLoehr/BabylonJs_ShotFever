import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export class Message_RegisterPlayer implements INetworkMessage {
  type: NetworkMessageTypes;
  data: string;

  constructor(playerName: string) {
    this.type = NetworkMessageTypes.registerPlayer;
    this.data = playerName;
  }
}
