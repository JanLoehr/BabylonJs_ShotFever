import { Observer, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import {
  IAiEventData,
  Message_AiEvent,
} from "../networking/messageTypes/Message_AiEvent";
import { Scene_Base } from "../scenes/Scene_Base";
import { AICharacterBase } from "./AICharacter_Base";

enum CueStates {
  Free,
  Targeted,
  Full,
}

export class AIManager {
  private AI_SPEED: number = 3;

  private scene: Scene_Base;

  private nextAiId: number = 0;

  private enterPath: TransformNode[];
  private exitPath: TransformNode[];
  private enterCue: CueStates[] = [];

  private aiCharacters: AICharacterBase[] = [];

  private updateObserver: Observer<Scene>;
  private disposeAiEventReceived: () => void;

  constructor(scene: Scene) {
    this.scene = scene as Scene_Base;

    this.disposeAiEventReceived = this.scene.networkManager.onAiEventReceived.sub(
      (id, data) => {
        console.log("this: ", this);
        this.onAiEvent(id, data);
      }
    );

    this.updateObserver = scene.onBeforeRenderObservable.add(() =>
      this.update(this.scene.getEngine().getDeltaTime() / 1000)
    );
  }

  private update(deltaTime: number): void {
    if (
      !this.enterPath ||
      this.enterPath.length <= 0 ||
      this.aiCharacters.length <= 0
    ) {
      return;
    }

    let removeFirst: boolean = false;

    this.aiCharacters.forEach((aiChar) => {
      if (aiChar.moveTargetId > -1) {
        // Look up the target transform
        let target = aiChar.isVaccinated
          ? this.exitPath[aiChar.moveTargetId]
          : this.enterPath[aiChar.moveTargetId];

        // get vector to target
        let direction = target.position
          .multiply(new Vector3(-1, 1, 1))
          .subtract(aiChar.rootMesh.position);

        // if the target is basically reached
        if (direction.length() < 0.1) {
          // first assume we'll stay here
          aiChar.pathFieldId = aiChar.moveTargetId;
          aiChar.moveTargetId = -1;

          if (!aiChar.isVaccinated) {
            // only write to entercue when entering
            this.enterCue[aiChar.pathFieldId] = CueStates.Full;
          }

          // but if the next field is valid and free, we'll go on
          let path = aiChar.isVaccinated ? this.exitPath : this.enterPath;
          if (aiChar.pathFieldId + 1 < path.length) {
            if (
              !aiChar.isVaccinated &&
              this.enterCue[aiChar.pathFieldId + 1] === CueStates.Free
            ) {
              // only write to entercue when entering
              this.enterCue[aiChar.pathFieldId] = CueStates.Free;
              this.enterCue[aiChar.pathFieldId + 1] = CueStates.Targeted;

              aiChar.moveTargetId = aiChar.pathFieldId + 1;

              // Also start timer (is only really executed the first time)
              aiChar.startProgress();
            } else if (aiChar.isVaccinated) {
              aiChar.moveTargetId = aiChar.pathFieldId + 1;
            }
          } else {
            // Otherwise set to exact position
            aiChar.rootMesh.position = target.position.multiply(
              new Vector3(-1, 1, 1)
            );

            direction = Vector3.Zero();
          }
        }

        // If not reached the target, move there
        if (direction.length() > 0) {
          direction.normalize();

          aiChar.rootMesh.position = aiChar.rootMesh.position.add(
            direction.scale(deltaTime).scale(this.AI_SPEED)
          );
        }
      } else if (
        !aiChar.isVaccinated &&
        this.enterCue[aiChar.pathFieldId + 1] === CueStates.Free
      ) {
        this.enterCue[aiChar.pathFieldId] = CueStates.Free;
        this.enterCue[aiChar.pathFieldId + 1] = CueStates.Targeted;
        aiChar.moveTargetId = aiChar.pathFieldId + 1;

        aiChar.startProgress();
      }

      // If the ai has exited fully
      if (aiChar.isVaccinated && aiChar.moveTargetId === -1) {
        aiChar.dispose();

        removeFirst = true;
      }
    });

    if (removeFirst) {
      this.aiCharacters.shift();
    }

    if (this.enterCue[0] === CueStates.Free) {
      this.addAICharacterAsync();
    }
  }

  dispose() {
    this.scene.onBeforeRenderObservable.remove(this.updateObserver);
    this.disposeAiEventReceived();
  }

  private onAiEvent(id: number, data: IAiEventData): void {
    console.log(this);
    if (data.eventName.includes("vaccinated")) {
      console.log(id, this.aiCharacters);
      this.aiCharacters.find((ai) => ai.ai_Id === id).setVaccinated();

      this.enterCue[this.enterCue.length - 1] = CueStates.Free;
    }
  }

  public AIVaccinated(aiId: number, progress: number) {
    this.enterCue[this.enterCue.length - 1] = CueStates.Free;

    if (progress > 0) {
      this.scene.networkManager.send(
        new Message_AiEvent({
          eventName: "vaccinated",
          aiId: aiId,
          data: progress.toString(),
        })
      );
    }
  }

  public setPaths(enterPath: TransformNode[], exitPath: TransformNode[]) {
    this.enterPath = enterPath;
    this.exitPath = exitPath;

    for (let i = 0; i < enterPath.length; i++) {
      this.enterCue.push(CueStates.Free);
    }

    this.addAICharacterAsync();
  }

  private async addAICharacterAsync() {
    let ai = new AICharacterBase(this.scene, this, this.nextAiId++);
    await ai.loadMeshAsync(this.enterPath[0]);

    ai.pathFieldId = -1;
    ai.moveTargetId = 0;

    this.aiCharacters.push(ai);
  }
}
