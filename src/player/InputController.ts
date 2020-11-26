import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";

export class InputController {
  public horizontal: number = 0;
  public vertical: number = 0;

  public dashPressed: boolean = false;
  public usePressed: boolean = false;
  public sprintPressed: boolean = false;

  private inputMap: { [key: string]: boolean } = {};

  constructor(scene: Scene) {
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (e) => {
        this.inputMap[e.sourceEvent.key] = true;
      })
    );

    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (e) => {
        this.inputMap[e.sourceEvent.key] = false;
      })
    );

    scene.onBeforeRenderObservable.add(() => {
      this.updateKeyboardInput();
    });
  }

  private updateKeyboardInput() {
    if (this.inputMap["w"] || this.inputMap["W"]) {
      this.vertical = 1;
    } else if (this.inputMap["s"] || this.inputMap["S"]) {
      this.vertical = -1;
    } else {
      this.vertical = 0;
    }

    if (this.inputMap["a"] || this.inputMap["A"]) {
      this.horizontal = -1;
    } else if (this.inputMap["d"] || this.inputMap["D"]) {
      this.horizontal = 1;
    } else {
      this.horizontal = 0;
    }
  }
}
