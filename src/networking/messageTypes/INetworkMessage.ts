export enum NetworkMessageTypes {
  registerPlayer,
  playerList,
  loadScene,
  playerPosition
}

export interface INetworkMessage {
  type: NetworkMessageTypes;
  data: any;
}
