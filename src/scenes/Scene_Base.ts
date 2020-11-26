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
  }

  public update() {
    this.deltaTime = this.engine.getDeltaTime() / 1000;
  }

  public render() {}
}
