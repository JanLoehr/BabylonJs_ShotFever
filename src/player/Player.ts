import {
  AnimationGroup,
  Camera,
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
import { InputController } from "./InputController";

export class Player {
  private PLAYER_SPEED: number = 5;

  private input: InputController;

  private camera: Camera;
  private root: Mesh;
  private meshRoot: TransformNode;
  private cameraRoot: TransformNode;

  public interactor: Mesh;
  private currentInteractable: Interactable_Base = undefined;
  private interactables: Interactable_Base[] = [];

  private animationBlend: number = 0;
  private currentAnimation: AnimationGroup;
  private nextAnimation: AnimationGroup;
  private idle: AnimationGroup;
  private walk: AnimationGroup;

  private wasInteractionPressed: boolean = false;

  private deltaTime: number;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.input = new InputController(scene);
  }

  public update(deltaTime: number) {
    this.deltaTime = deltaTime;

    let direction = this.updatePosition(deltaTime);

    this.updateAnimation(direction);

    if (this.input.actionPressed && !this.wasInteractionPressed) {
      this.wasInteractionPressed = true;

      if (this.interactables.length > 0) {
        this.currentInteractable = this.interactables[0];

        this.currentInteractable.mesh.parent = this.interactor;
        this.currentInteractable.mesh.position = Vector3.Zero();
      }
    } else if (!this.input.actionPressed && this.wasInteractionPressed) {
      this.wasInteractionPressed = false;

      if (this.currentInteractable) {
        let pos = this.currentInteractable.mesh.absolutePosition;
        this.currentInteractable.mesh.parent = null;
        this.currentInteractable.mesh.setAbsolutePosition(pos);

        this.currentInteractable = undefined;
      }
    }
  }

  public addInteractable(interactable: Interactable_Base) {
    this.interactables.push(interactable);
  }

  public removeInteractable(interactable: Interactable_Base) {
    this.interactables = this.interactables.filter((i) => i != interactable);
  }

  private updatePosition(deltaTime: number) {
    let direction = new Vector2(this.input.horizontal, this.input.vertical);

    let movement = new Vector3(
      direction.x * deltaTime * this.PLAYER_SPEED,
      0,
      direction.y * deltaTime * this.PLAYER_SPEED
    );

    this.root.moveWithCollisions(movement);
    this.root.position.y = 0;

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
    return direction;
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
    this.cameraRoot = new TransformNode("cameraRoot", scene);

    this.meshRoot.rotationQuaternion = Quaternion.Identity();
    this.meshRoot.parent = this.root;
    this.cameraRoot.parent = this.root;

    this.camera = new UniversalCamera("Camera", Vector3.Zero(), scene);
    this.camera.parent = this.cameraRoot;
    this.camera.position = new Vector3(0, 0, -10);

    this.cameraRoot.position.y = 1.3;
    this.cameraRoot.rotation.x = Math.PI * 0.2;

    var result = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "Robot.glb"
    );

    result.meshes.forEach((m) => {
      m.isPickable = false;
      m.checkCollisions = false;
      m.parent = this.meshRoot;
    });

    this.meshRoot.rotationQuaternion = new Quaternion(0, 1, 0, 0);

    this.interactor = MeshBuilder.CreateBox(
      "interactorMesh",
      { size: 1 },
      scene
    );

    this.interactor.position = new Vector3(0, 1, 1);
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
