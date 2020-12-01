import { Mesh } from "@babylonjs/core";
import { SimpleEventDispatcher } from "strongly-typed-events";

export class CustomMesh extends Mesh {
  public onPick = new SimpleEventDispatcher<string>();

  constructor(mesh: Mesh) {
    super(mesh.name, mesh.getScene(), mesh.parent, mesh);
    mesh.isVisible = false;
  }
}
