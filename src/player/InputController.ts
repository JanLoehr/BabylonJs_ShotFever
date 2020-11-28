import {
  ActionManager,
  ExecuteCodeAction,
  Scene,
  VirtualJoystick,
} from "@babylonjs/core";

export class InputController {
  public horizontal: number = 0;
  public vertical: number = 0;

  public dashPressed: boolean = false;
  public pickupPressed: boolean = false;
  public actionPressed: boolean = false;

  private inputMap: { [key: string]: boolean } = {};

  private isMobile: boolean = false;
  private leftJoystick: VirtualJoystick;

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

    //If mobile
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.isMobile = true;
      this.leftJoystick = new VirtualJoystick(true);
      VirtualJoystick.Canvas.style.zIndex = "4";
    }

    scene.onBeforeRenderObservable.add(() => {
      this.updateKeyboardInput();

      if (this.isMobile) {
        this.updateTouchInput();
      }
    });
  }

  private updateTouchInput() {
    this.horizontal = this.leftJoystick.pressed
      ? this.leftJoystick.deltaPosition.x
      : 0;
    this.vertical = this.leftJoystick.pressed
      ? this.leftJoystick.deltaPosition.y
      : 0;
  }

  private updateKeyboardInput() {
    if (this.inputMap["w"] || this.inputMap["arrowup"]) {
      this.vertical = 1;
    } else if (this.inputMap["s"] || this.inputMap["arrowdown"]) {
      this.vertical = -1;
    } else {
      this.vertical = 0;
    }

    if (this.inputMap["a"] || this.inputMap["arrowleft"]) {
      this.horizontal = -1;
    } else if (this.inputMap["d"] || this.inputMap["arrowright"]) {
      this.horizontal = 1;
    } else {
      this.horizontal = 0;
    }

    this.pickupPressed = this.inputMap[" "];
    this.dashPressed = this.inputMap["shift"];
    this.actionPressed = this.inputMap["control"];
  }
}
