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
import { InputController } from "./InputController";

export class Player {
  private PLAYER_SPEED: number = 5;

  private input: InputController;

  private camera: Camera;
  private root: Mesh;
  private meshRoot: TransformNode;
  private cameraRoot: TransformNode;

  private currentAnimation: AnimationGroup;
  private idle: AnimationGroup;
  private walk: AnimationGroup;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.input = new InputController(scene);

    this.setupPlayer(scene);
  }

  public update(deltaTime: number) {
    let direction = new Vector2(this.input.horizontal, this.input.vertical);

    let movement = new Vector3(
      direction.x * deltaTime * this.PLAYER_SPEED,
      0,
      direction.y * deltaTime * this.PLAYER_SPEED
    );

    this.root.moveWithCollisions(movement);

    let target: Quaternion;
    if (!direction.equals(Vector2.Zero())) {
      let angle = Math.atan2(direction.x, direction.y);
      target = Quaternion.FromEulerAngles(0, angle, 0);
    } else {
      target = Quaternion.FromEulerAngles(0, Math.PI, 0);
    }
    this.meshRoot.rotationQuaternion = Quaternion.Slerp(
      this.meshRoot.rotationQuaternion,
      target,
      deltaTime * 10
    );

    this.updateAnimation(direction);
  }

  private updateAnimation(moveDir: Vector2) {
    let nextAnimation: AnimationGroup = this.idle;

    if (!moveDir.equals(Vector2.Zero())) {
      nextAnimation = this.walk;
    }

    if (nextAnimation != this.currentAnimation) {
      if (this.currentAnimation) {
        this.currentAnimation.stop();
      }

      this.currentAnimation = nextAnimation;
      this.currentAnimation.play(this.currentAnimation.loopAnimation);
    }
  }

  private async setupPlayer(scene: Scene) {
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

    console.log(result);

    result.meshes.forEach((m) => {
      m.isPickable = false;
      m.checkCollisions = false;
      m.parent = this.meshRoot;
    });

    let collision = result.meshes.find((n) => n.name === "Collision");
    collision.isVisible = false;

    this.idle = result.animationGroups[1];
    this.walk = result.animationGroups[5];

    this.idle.loopAnimation = true;
    this.walk.loopAnimation = true;

    this.currentAnimation = this.idle;
    this.idle.play(this.idle.loopAnimation);
  }
}
