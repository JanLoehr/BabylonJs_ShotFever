export enum NetworkMessageTypes {
  registerPlayer,
  playerList,
  loadScene,
  playerPosition,
  playerInteraction,
  spawnInteractable,
  interactableEvent,
  playerEvent
}

export interface INetworkMessage {
  type: NetworkMessageTypes;
  data: any;
}
