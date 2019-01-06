import { PlayerModel } from '../../models/player-model';
import { FaceDefinitionModel } from '../../models/face-definition-model';
import { DiceModel } from '../../models/dice-model';
import { HandTypeModel } from '../../models/hand-type-model';
import { SelectIndex } from './select-index-interface';
export class SetPlayerProperties implements SelectIndex {
  index: number;
  key:string;
  value:any;
}
