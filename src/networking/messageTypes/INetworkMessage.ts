export enum NetworkMessageTypes{
    registerPlayer,
    playerList
}

export interface INetworkMessage {
  type: NetworkMessageTypes;
  data: any;
}
