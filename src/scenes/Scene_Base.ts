import { Engine, Scene } from "@babylonjs/core";

export class Scene_Base extends Scene {
  protected engine: Engine;
  protected canvas: HTMLCanvasElement;

  protected scene: Scene;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine);

    this.engine = engine;
    this.canvas = canvas;

    this.scene = new Scene(engine);
  }

  public render() {}
}
