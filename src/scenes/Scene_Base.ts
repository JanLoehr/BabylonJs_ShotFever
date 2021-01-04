import { Engine, Scene, TransformNode } from "@babylonjs/core";
import { AIManager } from "../ai/AIManager";
import { IInteractableEventData } from "../networking/messageTypes/Message_InteractableEvent";
import { NetworkManager } from "../networking/NetworkManager";
import { Player } from "../player/Player";
import { MeshInstancer } from "../utils/MeshInstancer";
import { SceneManager } from "./SceneManager";

export class Scene_Base extends Scene {
  protected engine: Engine;
  protected canvas: HTMLCanvasElement;

  public networkManager: NetworkManager;
  
  public player: Player;
  
  public meshInstancer: MeshInstancer;
  
  protected sceneManager: SceneManager;
  protected aiManager: AIManager;
  
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
    this.canvas = canvas;
    this.sceneManager = sceneManager;
    this.networkManager = networkManager;
    this.aiManager = new AIManager(this);

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
    this.aiManager.dispose();
    
    super.dispose();
  }
  
  protected onIteractableEvent(d: IInteractableEventData): void {
    this.meshInstancer.getById(d.objectId).onInteractableEvent(d.eventName);
  }
}
