import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export class Message_PlayerList implements INetworkMessage {
  type: NetworkMessageTypes;
  data: string[];

  constructor(playerNames: Map<string, string>) {
    this.type = NetworkMessageTypes.playerList;

    let playerStrings: string[] = [];
    playerNames.forEach((v, k) => {
      playerStrings.push(`${k},${v}`);
    });

    this.data = playerStrings;
  }
}
