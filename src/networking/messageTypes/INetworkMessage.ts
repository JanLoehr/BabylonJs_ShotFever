export enum NetworkMessageTypes {
  registerPlayer,
  playerList,
  loadScene,
  playerPosition,
  playerInteraction,
  spawnInteractable
}

export interface INetworkMessage {
  type: NetworkMessageTypes;
  data: any;
}
