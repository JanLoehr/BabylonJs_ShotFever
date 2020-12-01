import {
  ActionManager,
  ExecuteCodeAction,
  Mesh,
  PickingInfo,
  Ray,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { Player } from "../player/Player";
import { CustomMesh } from "../utils/CusomMesh";

export class Interactable_Base {
  public mesh: CustomMesh;

  protected scene: Scene;
  protected player: Player;

  protected canPickup: boolean = true;
  private pickedUp: boolean = false;
  private grounded: boolean = true;

  protected canUse: boolean = true;
  private isUsing: boolean = false;
  private usingStarted: number = 0;

  private moveSpeed: Vector3 = Vector3.Zero();
  private gravity: number = 1;

  constructor(
    scene: Scene,
    player: Player,
    mesh: Mesh = null,
    canPickup: boolean = true,
    canUse: boolean = true
  ) {
    this.scene = scene;
    this.player = player;
    this.canPickup = canPickup;
    this.canUse = canUse;

    if (mesh) {
      this.mesh = new CustomMesh(mesh);
      this.registerActions();
    }

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

    let mesh = result.meshes.find((m) => m.name === meshName) as Mesh;
    this.mesh = new CustomMesh(mesh);

    mesh.isVisible = false;

    this.registerActions();
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

  protected addtoPlayerInteractables() {
    if (this.mesh.isPickable) {
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
