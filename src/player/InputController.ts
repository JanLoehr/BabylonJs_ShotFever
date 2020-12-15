import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, StackPanel } from "@babylonjs/gui";
import { MenuButton, Spacer } from "../ui/Controls";
import { VirtualJoystick } from "../ui/VirtualJoystick";

export class InputController {
  public horizontal: number = 0;
  public vertical: number = 0;

  public dashPressed: boolean = false;
  public pickupPressed: boolean = false;
  public actionPressed: boolean = false;

  private inputMap: { [key: string]: boolean } = {};

  private isMobile: boolean = false;
  private leftJoystick: VirtualJoystick;

  private adt: AdvancedDynamicTexture;

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
      this.adt = AdvancedDynamicTexture.CreateFullscreenUI("menu", true, scene);

      this.isMobile = true;
      this.leftJoystick = new VirtualJoystick(this.adt);

      let panel = new StackPanel();
      panel.width = 0.3;
      panel.height = 0.3;
      panel.isVertical = false;
      panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

      this.adt.addControl(panel);

      let buttonSize = "60px";

      let takeButton = MenuButton(
        panel,
        "takeButton",
        "Take",
        () => {
          console.log("release");
          this.pickupPressed = false;
        },
        () => {
          console.log("pickup");
          this.pickupPressed = true;
        }
      );
      takeButton.width = buttonSize;
      takeButton.height = buttonSize;

      new Spacer(panel, "buttonSpacer", "30px", "1");

      let useButton = MenuButton(
        panel,
        "useButton",
        "Use",
        () => {
          this.actionPressed = false;
        },
        () => {
          this.actionPressed = true;
        }
      );
      useButton.width = buttonSize;
      useButton.height = buttonSize;
    }

    scene.onBeforeRenderObservable.add(() => {
      if (this.isMobile) {
        this.updateTouchInput();
      } else {
        this.updateKeyboardInput();
      }
    });
  }

  private updateTouchInput() {
    this.horizontal = this.leftJoystick.isPressed
      ? this.leftJoystick.horizontal
      : 0;
    this.vertical = this.leftJoystick.isPressed
      ? this.leftJoystick.vertical
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
