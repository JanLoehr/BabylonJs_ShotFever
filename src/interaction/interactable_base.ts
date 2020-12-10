import {
  ActionManager,
  ExecuteCodeAction,
  InstancedMesh,
  Mesh,
  PickingInfo,
  Ray,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { SignalDispatcher, SimpleEventDispatcher } from "strongly-typed-events";
import { Player } from "../player/Player";
import { Scene_Base } from "../scenes/Scene_Base";
import { InteractableTypes } from "../utils/MeshInstancer";

export class Interactable_Base {
  public mesh: InstancedMesh;

  public objectId: number;

  protected scene: Scene_Base;
  protected player: Player;

  public canPickup: boolean = true;
  private pickedUp: boolean = false;
  private grounded: boolean = true;
  public onPickup = new SignalDispatcher();

  public canUse: boolean = true;
  protected isUsing: boolean = false;
  protected usingStarted: number = 0;

  private moveSpeed: Vector3 = Vector3.Zero();
  private gravity: number = 1;

  constructor(
    scene: Scene_Base,
    objectId: number,
    player: Player,
    mesh: InstancedMesh = null,
    canPickup: boolean = true,
    canUse: boolean = true
  ) {
    this.scene = scene;
    this.player = player;
    this.canPickup = canPickup;
    this.canUse = canUse;
    this.objectId = objectId;

    if (mesh) {
      this.mesh = mesh;
      this.registerActions();
    }

    scene.onBeforeRenderObservable.add(() => {
      this.update(this.scene.getEngine().getDeltaTime() / 1000);
    });
  }

  protected update(deltaTime: number) {
    this.handlePickup(deltaTime);
  }

  private registerActions() {
    this.mesh.actionManager = new ActionManager(this.scene);

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: this.player.interactor,
        },
        () => {
          this.addtoPlayerInteractables();
        }
      )
    );

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: this.player.interactor,
        },
        () => {
          this.removefromPlayerInteractables();
        }
      )
    );
  }

  public pickUp(): boolean {
    if (this.canPickup && !this.isUsing) {
      this.pickedUp = true;

      this.onPickup.dispatch();
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

      return true;
    }

    return false;
  }

  public setSocket(node: TransformNode) {}

  protected addtoPlayerInteractables() {
    if (this.mesh.isPickable && (this.canUse || this.canPickup)) {
      this.player.addInteractable(this);
    }
  }

  protected removefromPlayerInteractables() {
    if (this.mesh.isPickable) {
      this.player.removeInteractable(this);
    }
  }

  private handlePickup(deltaTime: number) {
    if (!this.moveSpeed.equals(Vector3.Zero())) {
      this.mesh.position = this.mesh.position.add(
        this.moveSpeed.scale(deltaTime)
      );
    }

    if (!this.pickedUp) {
      if (!this.grounded) {
        let pick = this.checkIsGrounded();
        this.grounded = pick.hit;

        if (!this.grounded) {
          this.moveSpeed.y = this.moveSpeed.y - this.gravity;
        } else {
          this.moveSpeed = Vector3.Zero();
          this.landItem(pick);
        }
      }
    }
  }

  protected landItem(pick: PickingInfo) {
    this.mesh.position = pick.pickedPoint;
  }

  private checkIsGrounded(): PickingInfo {
    let ray = new Ray(
      this.mesh.absolutePosition.add(new Vector3(0, 0.5, 0)),
      Vector3.Down(),
      0.7
    );

    let pick = this.scene.pickWithRay(
      ray,
      (m) => m.isPickable && m.isVisible && m != this.mesh
    );

    return pick;
  }
}
