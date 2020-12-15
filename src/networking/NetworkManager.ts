import { Quaternion, Vector3 } from "@babylonjs/core";
import Peer, { DataConnection } from "peerjs";
import {
  EventDispatcher,
  SignalDispatcher,
  SimpleEventDispatcher,
} from "strongly-typed-events";
import { SceneKeys } from "../scenes/SceneManager";
import {
  INetworkMessage,
  NetworkMessageTypes,
} from "./messageTypes/INetworkMessage";
import {
  IInteractableEventData,
  Message_InteractableEvent,
} from "./messageTypes/Message_InteractableEvent";
import { Message_LoadScene } from "./messageTypes/Message_LoadScene";
import { Message_PlayerEvent } from "./messageTypes/Message_PlayerEvent";
import {
  IPlayerInteractionData,
  Message_PlayerInteraction,
} from "./messageTypes/Message_PlayerInteraction";
import { Message_PlayerList } from "./messageTypes/Message_PlayerList";
import { Message_PlayerPosition } from "./messageTypes/Message_PlayerPosition";
import { Message_RegisterPlayer } from "./messageTypes/Message_RegisterPlayer";
import {
  ISpawnInteractableData,
  Message_SpawnInteractable,
} from "./messageTypes/Message_SpawnInteractable";

export class NetworkManager {
  public onConnectionOpened = new SimpleEventDispatcher<string>();

  public onPeerConnected = new SignalDispatcher();
  public onConnectedToHost = new SignalDispatcher();
  public onConnectionClosed = new SignalDispatcher();

  public onPlayerNamesReceived = new SimpleEventDispatcher<string[]>();
  public onLoadSceneReceived = new SimpleEventDispatcher<SceneKeys>();

  public onPlayerPositionReceived = new EventDispatcher<string, Vector3>();
  public onPlayerInteractionReceived = new EventDispatcher<
    string,
    IPlayerInteractionData
  >();
  public onPlayerEventReceived = new EventDispatcher<string, string>();

  public onInteractableSpawnReceived = new SimpleEventDispatcher<ISpawnInteractableData>();
  public onInteractableEvent = new SimpleEventDispatcher<IInteractableEventData>();

  public players = new Map<string, string>();
  public isHost: boolean = false;

  private peer: Peer;

  private connection: DataConnection;

  private logging = true;

  private isSolo = false;

  public startHost(hostId: string, playerName: string) {
    this.isHost = true;

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

  public startLocal() {
    this.players.set("Solo", "Han");

    this.isSolo = true;
    this.isHost = true;
  }

  public getPlayerIndex(playerId: string = this.peer.id): number {
    let index = 0;
    let i = 0;
    this.players.forEach((v, k) => {
      if (k.includes(playerId)) {
        index = i;
      }

      i++;
    });

    return index;
  }

  public isLocalPlayer(playerId: string): boolean {
    return this.isSolo || this.peer.id === playerId;
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
      this.logging
        ? console.log("sending: " + NetworkMessageTypes[data.type], data.data)
        : null;

      this.connection.send(data);
    }
  }

  private receive(message: INetworkMessage) {
    this.logging
      ? console.log(
          "received: " + NetworkMessageTypes[message.type],
          message.data
        )
      : null;

    switch (message.type) {
      case NetworkMessageTypes.registerPlayer:
        {
          let msg = message as Message_RegisterPlayer;

          this.logging ? console.log("RegisterPlayer: " + msg.data) : null;

          this.players.set(this.connection.peer, msg.data);

          let playerNames: string[] = [];

          this.players.forEach((v, k) => playerNames.push(v));

          this.onPlayerNamesReceived.dispatch(playerNames);

          this.send(new Message_PlayerList(this.players));
        }
        break;

      case NetworkMessageTypes.playerList:
        {
          let msg = message as Message_PlayerList;

          let playerNames: string[] = [];

          this.players.clear();

          msg.data.forEach((n) => {
            this.players.set(n.split(",")[0], n.split(",")[1]);
          });

          this.players.forEach((p) => playerNames.push(p.valueOf()));

          this.onPlayerNamesReceived.dispatch(playerNames);
        }

        break;

      case NetworkMessageTypes.loadScene:
        {
          let msg = message as Message_LoadScene;

          this.onLoadSceneReceived.dispatch(msg.data);
        }

        break;

      case NetworkMessageTypes.playerPosition:
        {
          let msg = message as Message_PlayerPosition;

          let position = new Vector3(msg.data[0], msg.data[1], msg.data[2]);

          this.onPlayerPositionReceived.dispatch("playerId", position);
        }

        break;

      case NetworkMessageTypes.playerInteraction:
        {
          let msg = message as Message_PlayerInteraction;

          let data: IPlayerInteractionData = {
            interactionType: msg.data.interactionType,
            objectId: msg.data.objectId,
            position:
              msg.data.position.length > 0
                ? new Vector3(
                    msg.data.position[0],
                    msg.data.position[1],
                    msg.data.position[2]
                  )
                : Vector3.Zero(),
            rotation:
              msg.data.rotation.length > 0
                ? new Quaternion(
                    msg.data.rotation[0],
                    msg.data.rotation[1],
                    msg.data.rotation[2],
                    msg.data.rotation[3]
                  )
                : Quaternion.Identity(),
          };

          this.onPlayerInteractionReceived.dispatch("playerId", data);
        }

        break;

      case NetworkMessageTypes.spawnInteractable:
        {
          let msg = message as Message_SpawnInteractable;

          let data: ISpawnInteractableData = {
            interactbaleType: msg.data.interactbaleType,
            objectId: msg.data.objectId,
            parentName: msg.data.parentName,
            position:
              msg.data.position.length > 0
                ? new Vector3(
                    msg.data.position[0],
                    msg.data.position[1],
                    msg.data.position[2]
                  )
                : Vector3.Zero(),
            rotation:
              msg.data.rotation.length > 0
                ? new Quaternion(
                    msg.data.rotation[0],
                    msg.data.rotation[1],
                    msg.data.rotation[2],
                    msg.data.rotation[3]
                  )
                : Quaternion.Identity(),
          };

          this.onInteractableSpawnReceived.dispatch(data);
        }

        break;

      case NetworkMessageTypes.interactableEvent:
        {
          let msg = message as Message_InteractableEvent;
          this.onInteractableEvent.dispatch(msg.data);
        }

        break;

      case NetworkMessageTypes.playerEvent:
        {
          let msg = message as Message_PlayerEvent;
          this.onPlayerEventReceived.dispatch(
            msg.data.playerId,
            msg.data.eventName
          );
        }

        break;
    }
  }
}
