import { Behavior, Mesh } from "@babylonjs/core";
import { EventDispatcher } from "strongly-typed-events";
import { Interactable_Base } from "../interaction/interactable_base";

export class OnPickBehavior implements Behavior<Mesh> {
  public name: string = "onPickBehavior";

  public onPick = new EventDispatcher<Interactable_Base, string>();

  public meshOwner: any;

  public init(): void {}
  public attach(target: Mesh): void {}
  public detach(): void {}
}
