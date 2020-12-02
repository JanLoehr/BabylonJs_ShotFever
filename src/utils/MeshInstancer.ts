import { InstancedMesh, Mesh, SceneLoader } from "@babylonjs/core";

export enum MeshTypes {
  Syringe,
  Needle,
  Tablet,
  VaccineA,
  Syringe_Needle,
}

export class MeshInstancer {
  private meshes: Mesh[];

  constructor(filePath: string, fileName: string) {
    this.loadProps(filePath, fileName);
  }

  public async getMeshInstance(meshType: MeshTypes): Promise<InstancedMesh> {
    let mesh = this.meshes.find((m) => m.name.includes(MeshTypes[meshType]));

    return mesh.instantiateHierarchy() as InstancedMesh;
  }

  private async loadProps(filePath: string, fileName: string) {
    let res = await SceneLoader.ImportMeshAsync("", filePath, fileName);

    res.meshes.forEach((m) => {
      m.isVisible = false;
    });

    this.meshes = res.meshes as Mesh[];
  }
}
