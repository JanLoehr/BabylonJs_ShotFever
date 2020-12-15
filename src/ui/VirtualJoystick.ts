import { Color3, Color4 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, Ellipse } from "@babylonjs/gui";

export class VirtualJoystick {
  public horizontal: number;
  public vertical: number;

  public isPressed: boolean;

  private xStart: number;
  private yStart: number;

  constructor(adt: AdvancedDynamicTexture) {
    let sideJoystickOffset = 100;
    let bottomJoystickOffset = -50;

    let leftThumbContainer = this.makeThumbArea("leftThumb", 2, "blue", null);
    leftThumbContainer.height = "200px";
    leftThumbContainer.width = "200px";
    leftThumbContainer.isPointerBlocker = true;
    leftThumbContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftThumbContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    leftThumbContainer.alpha = 0.4;
    leftThumbContainer.left = sideJoystickOffset;
    leftThumbContainer.top = bottomJoystickOffset;

    let leftInnerThumbContainer = this.makeThumbArea(
      "leftInnterThumb",
      4,
      "blue",
      null
    );
    leftInnerThumbContainer.height = "80px";
    leftInnerThumbContainer.width = "80px";
    leftInnerThumbContainer.isPointerBlocker = true;
    leftInnerThumbContainer.horizontalAlignment =
      Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftInnerThumbContainer.verticalAlignment =
      Control.VERTICAL_ALIGNMENT_CENTER;

    let leftPuck = this.makeThumbArea("leftPuck", 0, "blue", "blue");
    leftPuck.height = "60px";
    leftPuck.width = "60px";
    leftPuck.isPointerBlocker = true;
    leftPuck.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftPuck.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

    leftThumbContainer.onPointerDownObservable.add((coordinates) => {
      this.xStart = coordinates.x;
      this.yStart = coordinates.y;

      this.isPressed = true;
    });

    leftThumbContainer.onPointerUpObservable.add(() => {
      this.xStart = 0;
      this.yStart = 0;

      this.isPressed = false;

      leftPuck.isVisible = false;
      leftThumbContainer.alpha = 0.4;
    });

    leftThumbContainer.onPointerMoveObservable.add((coordinates) => {
      if (this.isPressed) {
        this.horizontal = (coordinates.x - this.xStart) / 100;
        this.vertical = (this.yStart - coordinates.y) / 100;
      }
    });

    adt.addControl(leftThumbContainer);
    leftThumbContainer.addControl(leftInnerThumbContainer);
    leftThumbContainer.addControl(leftPuck);
    leftPuck.isVisible = false;
  }

  private makeThumbArea(
    name: string,
    thickness: number,
    color: string,
    background: string
  ): Ellipse {
    let rect = new Ellipse();
    rect.name = name;
    rect.thickness = thickness;
    rect.color = color;
    rect.background = background;
    rect.paddingLeft = "0px";
    rect.paddingRight = "0px";
    rect.paddingTop = "0px";
    rect.paddingBottom = "0px";

    return rect;
  }
}
