import { Engine, Scene, TransformNode } from "@babylonjs/core";
import { IInteractableEventData } from "../networking/messageTypes/Message_InteractableEvent";
import { NetworkManager } from "../networking/NetworkManager";
import { Player } from "../player/Player";
import { MeshInstancer } from "../utils/MeshInstancer";
import { SceneManager } from "./SceneManager";

export class Scene_Base extends Scene {
  protected engine: Engine;
  protected canvas: HTMLCanvasElement;
  public networkManager: NetworkManager;
  protected sceneManager: SceneManager;

  public player: Player;

  public meshInstancer: MeshInstancer;
  protected spawnPoints: TransformNode[] = [];

  private unsubFromOnInteractableEvent: () => void;

  constructor(
    engine: Engine,
    networkManager: NetworkManager,
    sceneManager: SceneManager,
    canvas: HTMLCanvasElement
  ) {
    super(engine);

    this.engine = engine;
    this.networkManager = networkManager;
    this.sceneManager = sceneManager;
    this.canvas = canvas;

    this.unsubFromOnInteractableEvent = this.networkManager.onInteractableEvent.sub((d) =>
      this.onIteractableEvent(d)
    );
  }

  public async loadScene(): Promise<Scene_Base> {
    return this;
  }

  public update(deltaTime: number) {}

  public render() {
    super.render();
  }

  public dispose(){
    this.unsubFromOnInteractableEvent();
    
    super.dispose();
  }
  
  protected onIteractableEvent(d: IInteractableEventData): void {
    this.meshInstancer.getById(d.objectId).onInteractableEvent(d.eventName);
  }
}
