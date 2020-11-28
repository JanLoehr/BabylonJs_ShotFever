import {
  Action,
  ActionManager,
  Color3,
  ExecuteCodeAction,
  Matrix,
  Mesh,
  MeshBuilder,
  PickingInfo,
  Quaternion,
  Ray,
  RayHelper,
  Scene,
  SceneLoader,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import { Player } from "../player/Player";

export class Interactable_Base {
  public mesh: Mesh;

  private scene: Scene;
  private player: Player;

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
    this.scene = scene;
    this.player = player;
    this.canPickup = canPickup;
    this.canUse = canUse;

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

  public async loadAssets(meshName: string) {
    let result = await SceneLoader.ImportMeshAsync(
      meshName,
      "./models/",
      "Props.glb"
    );

    this.mesh = result.meshes.find((m) => m.name === meshName) as Mesh;
    console.log(this.mesh);
    this.mesh.actionManager = new ActionManager(this.scene);

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: this.player.interactor,
        },
        (e) => {
          this.player.addInteractable(this);
        }
      )
    );

    this.mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionExitTrigger,
          parameter: this.player.interactor,
        },
        (e) => {
          this.player.removeInteractable(this);
        }
      )
    );
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
      (m) => m.isPickable && m.isVisible && m != this.mesh
    );

    return pick;
  }
}
