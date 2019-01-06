
import { FaceModel } from './face-model';
import { FaceDefinitionModel } from './face-definition-model';


export class DiceModel {
  public face: FaceDefinitionModel;
  constructor() {
    //generate random face
    //should be moved into Controller
    this.face = FaceModel.faces[Math.floor(Math.random() * FaceModel.faces.length)];
  }
}


