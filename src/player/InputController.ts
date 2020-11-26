import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";

export class InputController {
  public horizontal: number = 0;
  public vertical: number = 0;

  public dashPressed: boolean = false;
  public actionPressed: boolean = false;

  private inputMap: { [key: string]: boolean } = {};

  constructor(scene: Scene) {
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (e) => {
        this.inputMap[(e.sourceEvent.key as string).toLowerCase()] = true;
      })
    );

    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (e) => {
        this.inputMap[(e.sourceEvent.key as string).toLowerCase()] = false;
      })
    );

    scene.onBeforeRenderObservable.add(() => {
      this.updateKeyboardInput();
    });
  }

  private updateKeyboardInput() {
    if (this.inputMap["w"]) {
      this.vertical = 1;
    } else if (this.inputMap["s"]) {
      this.vertical = -1;
    } else {
      this.vertical = 0;
    }

    if (this.inputMap["a"]) {
      this.horizontal = -1;
    } else if (this.inputMap["d"]) {
      this.horizontal = 1;
    } else {
      this.horizontal = 0;
    }

    this.actionPressed = this.inputMap[" "];
    this.dashPressed = this.inputMap["shift"];
  }
}
