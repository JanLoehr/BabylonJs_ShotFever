import { Mesh, Scene } from "@babylonjs/core";
import { EventDispatcher, SimpleEventDispatcher } from "strongly-typed-events";

export class CustomMesh extends Mesh {
  public onPick = new EventDispatcher();

  constructor(mesh: Mesh, scene: Scene) {
    super(mesh.name, scene, null, mesh.clone() as Mesh);
    
    this.isVisible = true;
  }
}
