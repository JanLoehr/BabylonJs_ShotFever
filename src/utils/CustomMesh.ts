import { Mesh, Scene } from "@babylonjs/core";
import { SimpleEventDispatcher } from "strongly-typed-events";

export class CustomMesh extends Mesh {
  public onPick = new SimpleEventDispatcher<string>();

  constructor(mesh: Mesh, scene: Scene) {
    super(mesh.name, scene, null, mesh.clone() as Mesh);
    
    this.isVisible = true;
  }
}
