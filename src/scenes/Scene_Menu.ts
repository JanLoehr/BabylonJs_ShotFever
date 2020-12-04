import {
  Engine,
  HemisphericLight,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { NetworkManager } from "../networking/NetworkManager";
import { Scene_Base } from "./Scene_Base";
import { Message_RegisterPlayer } from "../networking/messageTypes/Message_RegisterPlayer";
import { ConnectMenu } from "../ui/ConnectMenu";
import { Lobby } from "../ui/LobbyMenu";

export class Scene_Menu extends Scene_Base {
  private roomId: string;
  private playerName: string;

  private adt: AdvancedDynamicTexture;
  private connectMenu: ConnectMenu;
  private lobbyMenu: Lobby;

  constructor(
    engine: Engine,
    networkManager: NetworkManager,
    canvas: HTMLCanvasElement
  ) {
    super(engine, networkManager, canvas);
  }

  public render() {
    super.render();
  }

  public async loadScene() {
    new UniversalCamera("cam", new Vector3(0, 0, -5), this);

    new HemisphericLight("light1", new Vector3(1, 1, 0), this);

    this.adt = AdvancedDynamicTexture.CreateFullscreenUI("menu", true, this);

    this.connectMenu = new ConnectMenu(
      this.adt,
      (host) => (this.roomId = host),
      (player) => (this.playerName = player),
      () => {
        this.tryHost();
      },
      () => {
        this.tryConnect();
      }
    );

    this.networkManager.onConnectionOpened.sub(
      (id: string) => (this.roomId = id)
    );

    return this;
  }

  private showLobby(isHost: boolean) {
    this.connectMenu.dispose();

    this.lobbyMenu = new Lobby(this.adt, isHost, this.roomId);

    this.networkManager.onPlayerNamesReceived.sub((names) => {
      this.lobbyMenu.setPlayers(names);
    });
  }

  private tryHost() {
    this.networkManager.startHost(this.roomId, this.playerName);

    this.showLobby(true);
  }

  private tryConnect() {
    this.networkManager.onConnectedToHost.sub(() =>
      setTimeout(
        () =>
          this.networkManager.send(new Message_RegisterPlayer(this.playerName)),
        1000
      )
    );
    this.networkManager.connect(this.roomId);

    this.showLobby(false);
  }
}