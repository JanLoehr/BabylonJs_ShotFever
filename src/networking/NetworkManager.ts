import Peer, { DataConnection } from "peerjs";
import { SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events";
import {
  INetworkMessage,
  NetworkMessageTypes,
} from "./messageTypes/INetworkMessage";
import { Message_PlayerList } from "./messageTypes/Message_PlayerList";
import { Message_RegisterPlayer } from "./messageTypes/Message_RegisterPlayer";

export class NetworkManager {
  public onConnectionOpened = new SimpleEventDispatcher<string>();

  public onPeerConnected = new SignalDispatcher();
  public onConnectedToHost = new SignalDispatcher();
  public onConnectionClosed = new SignalDispatcher();

  public onPlayerNamesReceived = new SimpleEventDispatcher<string[]>();

  private peer: Peer;

  private connection: DataConnection;

  private players = new Map<string, string>();

  private logging = false;

  public startHost(hostId: string, playerName: string) {
    this.peer = new Peer(hostId);
    this.logging ? console.log("start hosting: " + hostId) : null;

    this.peer.on("open", (id) => {
      this.logging ? console.log("connection opened: " + id) : null;

      this.players.set(hostId, playerName);
      this.onConnectionOpened.dispatch(id);
    });

    this.peer.on("connection", (conn) => {
      this.connection = conn;

      this.logging ? console.log("connection received: " + conn.peer) : null;

      this.setupConnection();

      this.onPeerConnected.dispatch();
    });
  }

  public connect(id: string) {
    this.peer = new Peer();

    this.logging ? console.log("opening connection") : null;

    this.peer.on("open", (myId) => {
      this.connection = this.peer.connect(id);

      this.connection.on("close", () => {
        this.logging ? console.log("connection closed") : null;

        this.onConnectionClosed.dispatch();
      });

      this.connection.on("open", () => {
        this.logging ? console.log("connection opened") : null;

        this.setupConnection();
        this.onConnectedToHost.dispatch();
      });
    });
  }

  private setupConnection() {
    this.connection.on("data", (data: any) => {
      this.logging
        ? console.log("received: " + NetworkMessageTypes[data.type])
        : null;

      this.receive(data);
    });
  }

  public send(data: INetworkMessage) {
    if (this.connection) {
      this.logging ? console.log("sending: " + data.type) : null;

      this.connection.send(data);
    }
  }

  private receive(message: INetworkMessage) {
    switch (message.type) {
      case NetworkMessageTypes.registerPlayer:
        {
          let msg = message as Message_RegisterPlayer;

          this.logging ? console.log("RegisterPlayer: " + msg.data) : null;

          this.players.set(this.connection.peer, msg.data);

          let playerNames: string[] = [];

          this.players.forEach((p) => playerNames.push(p.valueOf()));

          this.onPlayerNamesReceived.dispatch(playerNames);

          this.send(new Message_PlayerList(playerNames));
        }
        break;

      case NetworkMessageTypes.playerList:
        {
          let msg = message as Message_PlayerList;

          this.onPlayerNamesReceived.dispatch(msg.data);
        }

        break;
    }
  }
}
