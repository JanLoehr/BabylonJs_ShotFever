import {
  Action,
  ActionManager,
  ExecuteCodeAction,
  Matrix,
  Mesh,
  MeshBuilder,
  PickingInfo,
  Ray,
  RayHelper,
  Scene,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import { Player } from "../player/Player";

export class Interactable_Base {
  public mesh: Mesh;

  private scene: Scene;

  private canPickup: boolean = true;
  private pickedUp: boolean = false;
  private grounded: boolean = true;

  private canUse: boolean = true;
  private isUsing: boolean = false;
  private usingStarted: number = 0;

  private moveSpeed: Vector3 = Vector3.Zero();
  private gravity: number = 1;

  constructor(
    scene: Scene,
    player: Player,
    canPickup: boolean = true,
    canUse: boolean = true
  ) {
    this.mesh = MeshBuilder.CreateBox("interactable", { size: 0.5 }, scene);
    this.mesh.bakeTransformIntoVertices(Matrix.Translation(0, 0.25, 0));
    this.scene = scene;
    this.canPickup = canPickup;
    this.canUse = canUse;

    this.mesh.actionManager = new ActionManager(scene);

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: player.interactor,
        },
        (e) => {
          player.addInteractable(this);
        }
      )
    );

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: player.interactor,
        },
        (e) => {
          player.removeInteractable(this);
        }
      )
    );

    scene.onBeforeRenderObservable.add(() => {
      this.update(this.scene.getEngine().getDeltaTime() / 1000);
    });
  }

  private update(deltaTime: number) {
    this.handlePickup(deltaTime);

    if (this.isUsing) {
      this.mesh.visibility = Math.max(0, 1 - (Date.now() - this.usingStarted));
    }
  }

  public pickUp(): boolean {
    if (this.canPickup && !this.isUsing) {
      this.pickedUp = true;

      return true;
    }

    return false;
  }

  public drop(): boolean {
    if (this.canPickup && !this.isUsing) {
      this.pickedUp = false;
      this.grounded = false;

      return true;
    }

    return false;
  }

  public startUse(): boolean {
    if (this.canUse && !this.pickedUp) {
      this.isUsing = true;
      this.usingStarted = Date.now();

      return true;
    }

    return false;
  }

  public stopUse(): boolean {
    if (this.canUse && !this.pickedUp) {
      this.isUsing = false;
      this.mesh.visibility = 1;

      return true;
    }

    return false;
  }

  private handlePickup(deltaTime: number) {
    if (!this.pickedUp) {
      if (!this.grounded) {
        let pick = this.checkIsGrounded();
        this.grounded = pick.hit;

        if (!this.grounded) {
          this.moveSpeed.y = this.moveSpeed.y - this.gravity;

          this.mesh.position = this.mesh.position.add(
            this.moveSpeed.scale(deltaTime)
          );
        } else {
          this.mesh.position = pick.pickedPoint;

          this.moveSpeed = Vector3.Zero();
        }
      }
    }
  }

  private checkIsGrounded(): PickingInfo {
    let ray = new Ray(
      this.mesh.absolutePosition.add(new Vector3(0, 0.5, 0)),
      Vector3.Down(),
      0.7
    );

    let pick = this.scene.pickWithRay(
      ray,
      (m) => m.isPickable && m.isVisible && m.name != "interactable"
    );

    return pick;
  }
}
