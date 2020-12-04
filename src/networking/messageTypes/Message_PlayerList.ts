import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export class Message_PlayerList implements INetworkMessage {
  type: NetworkMessageTypes;
  data: string[];

  constructor(playerNames: string[]) {
    this.type = NetworkMessageTypes.playerList;
    this.data = playerNames;
  }
}
