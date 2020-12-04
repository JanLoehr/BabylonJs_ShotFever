import { SceneKeys } from "../../scenes/SceneManager";
import { INetworkMessage, NetworkMessageTypes } from "./INetworkMessage";

export class Message_LoadScene implements INetworkMessage {
  type: NetworkMessageTypes;
  data: SceneKeys;

  constructor(sceneKey: SceneKeys) {
    this.type = NetworkMessageTypes.loadScene;
    this.data = sceneKey;
  }
}
