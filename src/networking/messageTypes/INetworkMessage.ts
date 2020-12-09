export enum NetworkMessageTypes {
  registerPlayer,
  playerList,
  loadScene,
  playerPosition,
  playerInteraction
}

export interface INetworkMessage {
  type: NetworkMessageTypes;
  data: any;
}
