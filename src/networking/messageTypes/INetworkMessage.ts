export enum NetworkMessageTypes {
  registerPlayer,
  playerList,
  loadScene
}

export interface INetworkMessage {
  type: NetworkMessageTypes;
  data: any;
}
