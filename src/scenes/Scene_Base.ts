import { Engine, Scene } from "@babylonjs/core";
import { Player } from "../player/Player";
import { MeshInstancer } from "../utils/MeshInstancer";

export class Scene_Base extends Scene {
  protected engine: Engine;
  protected canvas: HTMLCanvasElement;

  public player: Player;

  public meshInstancer: MeshInstancer;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine);

    this.engine = engine;
    this.canvas = canvas;
  }

  public async loadScene(): Promise<Scene_Base> {
    return this;
  }

  public update(deltaTime: number) {}

  public render() {
    super.render();
  }

  public unload() {}
}
