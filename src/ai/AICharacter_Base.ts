import {
  Color3,
  Matrix,
  Mesh,
  MeshBuilder,
  Observer,
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Container,
  Image,
  Rectangle,
  StackPanel,
} from "@babylonjs/gui";
import { OnPickBehavior } from "../behaviors/onPickBehavior";
import { Interactable_Base } from "../interaction/interactable_base";
import { VaccineTypes } from "../interaction/Vaccine";
import { GuiIcon, Spacer } from "../ui/Controls";
import { ProgressBar } from "../ui/ProgressBar";
import { AIManager } from "./AIManager";

export class AICharacterBase {
  public rootMesh: Mesh;
  public order: VaccineTypes = VaccineTypes.yellow;

  public ai_Id: number;

  public moveTargetId: number;
  public pathFieldId: number;
  public isVaccinated: boolean = false;

  private scene: Scene;
  private aiManager: AIManager;

  private updateObserver: Observer<Scene>;

  private lastPosition: Vector3;
  private lastRotation: Quaternion;

  private adt: AdvancedDynamicTexture;
  private guiRoot: Rectangle;
  private guiContainer: StackPanel;
  private progressBar: ProgressBar;

  private progressValue: number = 1;
  private progressStart: number = 0;
  private progressDuration: number = 30;

  constructor(scene: Scene, aiManager: AIManager, id: number) {
    this.ai_Id = id;
    this.aiManager = aiManager;
    this.scene = scene;

    this.updateObserver = scene.onBeforeRenderObservable.add(() =>
      this.update()
    );
  }

  private update(): void {
    //enter animation logic here
    if (this.rootMesh) {
      let movement = this.rootMesh.position.subtract(this.lastPosition);

      this.lastPosition = this.rootMesh.position;
      this.lastRotation = this.rootMesh.rotationQuaternion;
    }

    if (this.progressStart > 0 && !this.isVaccinated) {
      this.progressValue =
        1 - (Date.now() - this.progressStart) / 1000 / this.progressDuration;
      this.progressBar.setValue(this.progressValue);

      if (this.progressValue < 0 && !this.isVaccinated) {
        this.onFailed();
      }
    }
  }

  public dispose() {
    this.rootMesh.dispose();
    this.adt.dispose();

    this.scene.onBeforeRenderObservable.remove(this.updateObserver);
  }

  public setVaccinated() {
    this.isVaccinated = true;

    this.guiContainer.dispose();

    let guiIcon = GuiIcon(this.guiRoot, "Checkmark");
    guiIcon.width = 0.7;
    guiIcon.height = 0.7;

    this.moveTargetId = 1;
  }

  private onPicked(sender: Interactable_Base, args: string): void {
    if (args.includes("vaccinated")) {
      this.isVaccinated = true;

      this.guiContainer.dispose();

      let guiIcon = GuiIcon(this.guiRoot, "Checkmark");
      guiIcon.width = 0.7;
      guiIcon.height = 0.7;

      this.moveTargetId = 1;
      this.aiManager.AIVaccinated(this.ai_Id, this.progressValue);
    }
  }

  private onFailed(): void {
    this.isVaccinated = true;

    this.guiContainer.dispose();

    let guiIcon = GuiIcon(this.guiRoot, "Cross");
    guiIcon.width = 0.7;
    guiIcon.height = 0.7;

    this.moveTargetId = 1;
    this.aiManager.AIVaccinated(this.ai_Id, 0);
  }

  public startProgress() {
    if (this.progressStart === 0) {
      this.progressStart = Date.now();
    }
  }

  public async loadMeshAsync(start: TransformNode) {
    let cylinder = MeshBuilder.CreateCylinder("ai_root", {
      diameter: 1,
      height: 1.8,
    });

    cylinder.bakeTransformIntoVertices(Matrix.Translation(0, 0.9, 0));

    this.rootMesh = cylinder;

    this.rootMesh.parent = start;
    this.rootMesh.setParent(null);

    this.lastPosition = this.rootMesh.position;
    this.lastRotation = this.rootMesh.rotationQuaternion;

    let onPickBehavior = new OnPickBehavior();
    onPickBehavior.meshOwner = this;
    onPickBehavior.onPick.sub((sender, args) => this.onPicked(sender, args));

    this.rootMesh.addBehavior(onPickBehavior);

    let guiMesh = MeshBuilder.CreatePlane("ui_plane", { size: 0.7 });
    guiMesh.parent = this.rootMesh;
    guiMesh.position = new Vector3(0, 2.5, 0);
    guiMesh.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);

    let adt = AdvancedDynamicTexture.CreateForMesh(guiMesh, 256, 256);
    this.adt = adt;

    let rectangle = new Rectangle("container");
    rectangle.color = "black";
    rectangle.thickness = 5;
    rectangle.cornerRadius = 20;
    rectangle.background = "white";

    this.guiRoot = rectangle;

    let stackpanel = new StackPanel("stackpanel");
    stackpanel.width = 1;
    stackpanel.height = 1;

    rectangle.addControl(stackpanel);

    this.guiContainer = stackpanel;
    adt.addControl(rectangle);

    new Spacer(this.guiContainer, "topSpace", "256px", "10px");

    let guiIcon = GuiIcon(this.guiContainer, "Vaccine_Yellow");
    guiIcon.width = "200px";
    guiIcon.height = "200px";

    this.progressBar = new ProgressBar(
      null,
      this.guiContainer,
      Color3.Green(),
      256,
      50
    );
    this.progressBar.setValue(1);
  }
}
