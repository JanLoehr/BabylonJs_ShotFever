import {
  InstancedMesh,
  Mesh,
  Scene,
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

export enum MeshTypes {
  Syringe = "Syringe",
  Needle = "Needle",
  Tablet = "Tablet",
  Vaccine = "Vaccine_A",
}

export class MeshInstancer {
  private meshes: { [type: string]: Mesh } = {};

  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public async getMeshInstance(meshType: MeshTypes): Promise<TransformNode> {
    if (!this.meshes[meshType]) {
      let res = await SceneLoader.ImportMeshAsync(
        meshType.toString(),
        "./models/",
        "Props.glb",
        this.scene
      );

      this.meshes[meshType] = res.meshes[1] as Mesh;

      // this.meshes[meshType].isVisible = false;
    }

    let instance = this.meshes[meshType].instantiateHierarchy();
    return instance;
  }
}
