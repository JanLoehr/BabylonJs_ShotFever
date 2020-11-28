import { Engine, Scene } from "@babylonjs/core";
import { Player } from "../player/Player";

export class Scene_Base extends Scene {
  protected engine: Engine;
  protected canvas: HTMLCanvasElement;

  protected scene: Scene;

  protected player: Player;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine);

    this.engine = engine;
    this.canvas = canvas;

    this.scene = new Scene(engine);

    this.scene.onBeforeRenderObservable.add(() => {
      this.update(engine.getDeltaTime() / 1000);
    });
  }

  public async loadScene(): Promise<Scene_Base> {
    return this;
  }

  protected update(deltaTime: number) {}

  public render() {}
}
