import { FaceDefinitionModel } from './face-definition-model';
import { DiceModel } from './dice-model';
import { HandTypeModel } from './hand-type-model';


export class PlayerModel {
  public hand: FaceDefinitionModel[];
  public handStats: HandTypeModel;
  public chances: number;
  public isWinner: boolean = false;
  public color : string;
  public icon : string;
  constructor() {
    //5 dices
    this.hand = [
      new DiceModel().face,
      new DiceModel().face,
      new DiceModel().face,
      new DiceModel().face,
      new DiceModel().face
    ].sort((n1,n2) => n1.faceRank - n2.faceRank);
     this.chances = 3;
  }
 public setProps (key: string, value: any) : void {
    this[key] = value;
  }
}
