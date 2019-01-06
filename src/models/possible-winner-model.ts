import { PlayerModel } from './player-model';

export class WinnerModel {
  public totalFaceCount: number;
  public player: PlayerModel;
  constructor(count: number, Player: PlayerModel) {
    this.totalFaceCount = count;
    //console.log(this.totalFaceCount);
    this.player = Player;
  }
}
