import {
  Mesh,
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";


export enum MeshTypes {
  Syringe,
  Needle,
  Tablet,
  VaccineA,
  Syringe_Needle
}

export class MeshInstancer {
  private meshes: Mesh[];

  constructor(filePath: string, fileName: string) {
    this.loadProps(filePath, fileName);
  }

  public async getMeshInstance(meshType: MeshTypes): Promise<Mesh> {
    let mesh = this.meshes.find((m) => m.name.includes(MeshTypes[meshType]));

    return mesh;
  }

  private async loadProps(filePath: string, fileName: string) {
    let res = await SceneLoader.ImportMeshAsync("", filePath, fileName);

    res.meshes.forEach((m) => {
      m.isVisible = false;
    });

    this.meshes = res.meshes as Mesh[];
  }
}
