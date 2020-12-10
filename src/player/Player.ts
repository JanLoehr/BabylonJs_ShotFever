import {
  AbstractAssetTask,
  AnimationGroup,
  Camera,
  CubeMapToSphericalPolynomialTools,
  Matrix,
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene,
  SceneLoader,
  TransformNode,
  UniversalCamera,
  Vector2,
  Vector3,
} from "@babylonjs/core";
import { Interactable_Base } from "../interaction/interactable_base";
import {
  InteractionTypes,
  IPlayerInteractionData,
  Message_PlayerInteraction,
} from "../networking/messageTypes/Message_PlayerInteraction";
import { Message_PlayerPosition } from "../networking/messageTypes/Message_PlayerPosition";
import { Scene_Base } from "../scenes/Scene_Base";
import { InputController } from "./InputController";

export class Player {
  private PLAYER_SPEED: number = 5;
  private SYNC_INTERVALL: number = 100;

  private scene: Scene_Base;

  private isLocalPlayer: boolean;
  private networkId: string;
  private name: string;
  private lastPosition: Vector3 = Vector3.Zero();
  private lasSync: number = 0;
  private positionCache: Vector3[] = [];

  private input: InputController;
  private moveDir: Vector2;

  private camera: Camera;
  private root: Mesh;
  private meshRoot: TransformNode;
  private cameraRoot: TransformNode;

  public interactor: Mesh;
  private currentInteractable: Interactable_Base = undefined;
  private lerpInteractable: number = 0;
  private interactables: Interactable_Base[] = [];

  private animationBlend: number = 0;
  private currentAnimation: AnimationGroup;
  private nextAnimation: AnimationGroup;
  private idle: AnimationGroup;
  private walk: AnimationGroup;

  private wasPickupPressed: boolean = false;
  private wasActionPressed: boolean = false;

  private deltaTime: number;

  constructor(
    scene: Scene_Base,
    canvas: HTMLCanvasElement,
    isLocalPlayer: boolean,
    networkId: string,
    name: string
  ) {
    this.scene = scene;
    this.isLocalPlayer = isLocalPlayer;
    this.networkId = networkId;
    this.name = name;

    if (isLocalPlayer) {
      this.input = new InputController(scene);
    } else {
      this.scene.networkManager.onPlayerPositionReceived.sub((s, p) =>
        this.positionCache.push(p.clone())
      );

      this.scene.networkManager.onPlayerInteractionReceived.sub((s, d) =>
        this.handleInteraction_Remote(d)
      );
    }

    scene.onBeforeRenderObservable.add(() => {
      this.update(scene.getEngine().getDeltaTime() / 1000);
    });
  }

  private update(deltaTime: number) {
    this.deltaTime = deltaTime;

    if (this.isLocalPlayer) {
      this.moveDir = this.updatePosition(deltaTime);

      if (
        !this.root.position.equals(this.lastPosition) &&
        Date.now() - this.lasSync > this.SYNC_INTERVALL
      ) {
        this.lastPosition = this.root.position.clone();
        this.lasSync = Date.now();

        this.scene.networkManager.send(
          new Message_PlayerPosition(this.lastPosition)
        );
      }
    } else {
      this.moveDir = this.moveNetworked(deltaTime);
    }

    this.updateRotation(this.moveDir, deltaTime);
    this.updateAnimation(this.moveDir);

    this.handlePickup();

    if (this.isLocalPlayer) {
      this.handleAction();
    }
  }

  private handleAction() {
    if (
      this.input.actionPressed &&
      !this.wasActionPressed &&
      this.moveDir.equals(Vector2.Zero())
    ) {
      if (this.interactables.length > 0 && this.interactables[0].startUse()) {
        this.wasActionPressed = true;

        this.currentInteractable = this.interactables[0];

        this.scene.networkManager.send(
          new Message_PlayerInteraction({
            interactionType: InteractionTypes.useSart,
            objectId: this.currentInteractable.objectId,
          })
        );
      }
    } else if (
      (this.currentInteractable && // ActionKey Released
        !this.input.actionPressed &&
        this.wasActionPressed) ||
      (this.currentInteractable && // Moved while Actioning
        this.wasActionPressed &&
        !this.moveDir.equals(Vector2.Zero()))
    ) {
      this.wasActionPressed = false;

      this.scene.networkManager.send(
        new Message_PlayerInteraction({
          interactionType: InteractionTypes.useStop,
          objectId: this.currentInteractable.objectId,
        })
      );

      this.currentInteractable.stopUse();
      this.currentInteractable = null;
    }
  }

  private handlePickup() {
    if (this.isLocalPlayer) {
      if (this.input.pickupPressed && !this.wasPickupPressed) {
        console.log(this.interactables);
        if (this.interactables.length > 0 && this.interactables[0].pickUp()) {
          this.wasPickupPressed = true;

          this.currentInteractable = this.interactables[0];
          this.currentInteractable.mesh.setParent(this.interactor);

          this.lerpInteractable = 0;

          this.scene.networkManager.send(
            new Message_PlayerInteraction({
              interactionType: InteractionTypes.pickup,
              objectId: this.currentInteractable.objectId,
            })
          );
        }
      } else if (!this.input.pickupPressed && this.wasPickupPressed) {
        this.wasPickupPressed = false;

        if (this.currentInteractable) {
          this.currentInteractable.mesh.setParent(null);

          this.currentInteractable.drop();

          this.scene.networkManager.send(
            new Message_PlayerInteraction({
              interactionType: InteractionTypes.drop,
              objectId: this.currentInteractable.objectId,
              position: this.currentInteractable.mesh.position,
              rotation: this.currentInteractable.mesh.rotationQuaternion,
            })
          );

          this.currentInteractable = undefined;
        }
      }
    }

    if (
      this.currentInteractable &&
      this.wasPickupPressed &&
      this.lerpInteractable < 1
    ) {
      this.lerpInteractable += this.deltaTime * 4;

      if (!this.currentInteractable.mesh.rotationQuaternion) {
        this.currentInteractable.mesh.rotationQuaternion = this.currentInteractable.mesh.rotation.toQuaternion();
      }
      this.currentInteractable.mesh.position = Vector3.Lerp(
        this.currentInteractable.mesh.position,
        Vector3.Zero(),
        this.lerpInteractable
      );
      this.currentInteractable.mesh.rotationQuaternion = Quaternion.Slerp(
        this.currentInteractable.mesh.rotationQuaternion,
        Quaternion.Identity(),
        this.lerpInteractable
      );
    }
  }

  private async handleInteraction_Remote(data: IPlayerInteractionData) {
    switch (data.interactionType) {
      case InteractionTypes.pickup:
        {
          this.currentInteractable = this.scene.meshInstancer.getById(
            data.objectId
          );

          this.currentInteractable.pickUp();
          this.currentInteractable.mesh.setParent(this.interactor);

          this.wasPickupPressed = true;
          this.lerpInteractable = 0;
        }
        break;

      case InteractionTypes.drop:
        {
          if (this.currentInteractable) {
            this.currentInteractable.mesh.setParent(null);

            this.currentInteractable.mesh.position = data.position;
            this.currentInteractable.mesh.rotationQuaternion = data.rotation;
            this.currentInteractable.mesh.computeWorldMatrix();

            this.currentInteractable.drop();
            this.wasPickupPressed = false;

            this.currentInteractable = null;
          }
        }
        break;

      case InteractionTypes.useSart:
        {
          this.wasActionPressed = true;

          this.currentInteractable = this.scene.meshInstancer.getById(
            data.objectId
          );

          this.currentInteractable.startUse();
        }
        break;

      case InteractionTypes.useStop:
        {
          this.wasActionPressed = false;

          this.currentInteractable.stopUse();
          this.currentInteractable = null;
        }
        break;
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public addInteractable(interactable: Interactable_Base) {
    this.interactables.push(interactable);
  }

  public removeInteractable(interactable: Interactable_Base) {
    this.interactables = this.interactables.filter((i) => i != interactable);
  }

  public setPosition(position: Vector3) {
    this.root.position = position;
  }

  private updatePosition(deltaTime: number) {
    let direction = new Vector2(
      this.input.horizontal,
      this.input.vertical
    ).normalize();

    let movement = new Vector3(
      direction.x * deltaTime * this.PLAYER_SPEED,
      0,
      direction.y * deltaTime * this.PLAYER_SPEED
    );

    this.root.moveWithCollisions(movement);
    this.root.position.y = 0;

    return direction;
  }

  private moveNetworked(deltaTime: number): Vector2 {
    let moveDir = Vector2.Zero();

    if (this.positionCache.length > 0) {
      let dir = this.positionCache[0].subtract(this.root.position);

      if (dir.length() < 0.1 * this.positionCache.length) {
        this.positionCache.shift();
      } else if (dir.length() > 2) {
        this.positionCache.shift();
        this.root.position = this.positionCache[0];
      } else {
        moveDir = new Vector2(dir.x, dir.z).normalize();

        let movement = new Vector3(
          moveDir.x * deltaTime * this.PLAYER_SPEED,
          0,
          moveDir.y * deltaTime * this.PLAYER_SPEED
        );

        movement.scaleInPlace(1 + (this.positionCache.length - 1) / 10);

        this.root.moveWithCollisions(movement);
        this.root.position.y = 0;
      }
    }

    return moveDir;
  }

  private updateRotation(direction: Vector2, deltaTime: number) {
    let target: Quaternion;
    if (!direction.equals(Vector2.Zero())) {
      let angle = Math.atan2(direction.x, direction.y);
      target = Quaternion.FromEulerAngles(0, angle, 0);

      this.meshRoot.rotationQuaternion = Quaternion.Slerp(
        this.meshRoot.rotationQuaternion,
        target,
        deltaTime * 10
      );
    }
  }

  private updateAnimation(moveDir: Vector2) {
    let nextAnimation: AnimationGroup = this.idle;

    if (!moveDir.equals(Vector2.Zero())) {
      nextAnimation = this.walk;
    }

    if (nextAnimation != this.currentAnimation) {
      if (this.animationBlend === 1) {
        this.animationBlend = 0;
      }

      this.nextAnimation = nextAnimation;
      this.nextAnimation.setWeightForAllAnimatables(0);
      this.nextAnimation.play(this.nextAnimation.loopAnimation);
    }

    if (this.currentAnimation && this.nextAnimation) {
      if (this.animationBlend < 1) {
        this.currentAnimation.setWeightForAllAnimatables(
          1 - this.animationBlend
        );
        this.nextAnimation.setWeightForAllAnimatables(this.animationBlend);

        this.animationBlend += this.deltaTime * 4;

        if (this.animationBlend >= 1) {
          this.animationBlend = 1;

          this.currentAnimation.stop();
          this.currentAnimation = this.nextAnimation;
          this.nextAnimation = undefined;
        }
      }
    }
  }

  public async loadPlayer(scene: Scene) {
    this.root = MeshBuilder.CreateCylinder(
      "playerRoot",
      {
        diameter: 1,
        height: 1.8,
        subdivisions: 1,
        tessellation: 12,
      },
      scene
    );
    this.root.bakeTransformIntoVertices(Matrix.Translation(0, 0.9, 0));
    this.root.checkCollisions = true;
    this.root.isVisible = false;

    this.meshRoot = new TransformNode("playerMeshRoot", scene);

    this.meshRoot.rotationQuaternion = Quaternion.Identity();
    this.meshRoot.parent = this.root;

    if (this.isLocalPlayer) {
      this.cameraRoot = new TransformNode("cameraRoot", scene);

      this.cameraRoot.parent = this.root;

      this.camera = new UniversalCamera("Camera", Vector3.Zero(), scene);
      this.camera.parent = this.cameraRoot;
      this.camera.position = new Vector3(0, 0, -10);

      this.cameraRoot.position.y = 1.3;
      this.cameraRoot.rotation.x = Math.PI * 0.2;
    }

    var result = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "Robot.glb",
      scene
    );

    result.meshes.forEach((m) => {
      m.isPickable = false;
      m.checkCollisions = false;
      m.parent = this.meshRoot;
    });

    this.meshRoot.rotationQuaternion = new Quaternion(0, 1, 0, 0);

    this.interactor = MeshBuilder.CreateBox(
      "interactorMesh",
      { width: 1, depth: 1, height: 3 },
      scene
    );

    this.interactor.position = new Vector3(0, 1, 1);
    this.interactor.rotationQuaternion = new Vector3(
      0,
      0,
      Math.PI
    ).toQuaternion();
    this.interactor.checkCollisions = false;
    this.interactor.isPickable = false;
    this.interactor.isVisible = false;
    this.interactor.parent = this.meshRoot;

    this.idle = result.animationGroups[1];
    this.walk = result.animationGroups[5];

    this.idle.loopAnimation = true;
    this.walk.loopAnimation = true;

    this.currentAnimation = this.idle;
    this.idle.play(this.idle.loopAnimation);
  }
}
