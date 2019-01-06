import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { PlayerModel } from '../models/player-model';
import { WinnerModel } from '../models/possible-winner-model';
import { DiceModel } from '../models/dice-model';
import { HandTypeModel } from '../models/hand-type-model';
import { WindowRef } from '../services/window-ref.service';
import { FaceModel } from '../models/face-model';
import { FaceDefinitionModel } from '../models/face-definition-model';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StoreState } from '../state/models/store-state';
import * as reducers from '../state/actions/player-action';
import * as Layout from '../state/interface/player-layout-state-interface';

@Component({
  selector: 'poker',
  templateUrl: './poker.component.html',
  styles: [`.span-right{  margin-right : 2px;}`,
    `.span-left{
  margin-left : 10px;
}`,
    `.some-margin{ margin-top:15px; }`,
    `.font-black{ color:black;}`,
    `.center{ text-align:center}`,
    `.center{ margin:auto}`]
})
export class PokerComponent {

  gameOver: boolean = false;

  private numOfPlayers: number

  players: PlayerModel[] = [];

  winref: WindowRef;

  layouts: Layout.PlayerLayoutState;

  constructor(private winRef: WindowRef, private cdRef: ChangeDetectorRef, private store: Store<StoreState>) {
    // getting the native window obj
    this.winref = winRef;
    store.pipe(select('num')).subscribe((x: number) => {
      this.numOfPlayers = x;
    });

    store.pipe(select('players')).subscribe((p: PlayerModel[]) => {
      this.players = p;
    });

    store.pipe(select('layouts')).subscribe((c: Layout.PlayerLayoutState) => {
      this.layouts = c;
    });
  }

  ngOnInit() {
    this.initPlayers().then(() => {
      this.pickWinner();
    })

  }


  public getTotalFaceRanks(player: PlayerModel): number {
    return player.hand.map((h) => { return h.faceRank }).reduce((a, b) => a + b);
  }

  public reroll(i: number) {
    //reduce chance
    let player = this.players[i];

    if (player.chances > 0) {
      this.store.dispatch(new reducers.UpdatePlayer(
        { key: 'chances', value: (player.chances - 1), index: i }));

      //perform reroll
      let hand: FaceDefinitionModel[] = [
        new DiceModel().face,
        new DiceModel().face,
        new DiceModel().face,
        new DiceModel().face,
        new DiceModel().face
      ].sort((n1, n2) => n1.faceRank - n2.faceRank);

      this.store.dispatch(new reducers.UpdatePlayer({ index: i, key: 'hand', value: hand }));

      this.checks(player.hand).then((pM: HandTypeModel) => {

        this.store.dispatch(new reducers.UpdatePlayer(
          { key: 'handStats', value: pM, index: i }
        ));
        this.clearWinners().then(() => {
          this.pickWinner();
        });
      });
    }
  }

  public showStatus(chances: number): boolean {
    return chances == 0;
  }


  public initPlayers(): Promise<any> {
    this.store.dispatch(new reducers.InitializeLayout());
    let promises_array: Array<any> = [];
    for (let i = 0; i < this.numOfPlayers; i++) {
      promises_array.push(new Promise((resolve, reject) => {
        let np = new PlayerModel();
        this.store.dispatch(new reducers.PushPlayer({ player: np }));
        this.checks(this.players[i].hand).then((handStats: HandTypeModel) => {
          this.store.dispatch(new reducers.UpdatePlayer(
            { key: 'handStats', value: handStats, index: i }));

          let chosenColor: string = this.layouts.colors[Math.floor(Math.random() * this.layouts.colors.length)];
          let chosenIcon : string = this.layouts.icons[Math.floor(Math.random() * this.layouts.icons.length)];

          this.store.dispatch(new reducers.UpdatePlayer(
            { key: 'color', value: chosenColor, index: i }));
          this.store.dispatch(new reducers.UpdatePlayer(
              { key: 'icon', value: chosenIcon, index: i }));
  

  
          this.store.dispatch(new reducers.RemoveLayout({ color: chosenColor, icon : chosenIcon }));
          
          return resolve(true);
        })
      }));
    }
    return Promise.all(promises_array);
  }


  public clearWinners(): Promise<any> {
    let promises_array: Array<any> = [];
    for (let i = 0; i < this.players.length; i++) {
      promises_array.push(new Promise((resolve, reject) => {
        this.store.dispatch(new reducers.UpdatePlayer(
          { key: 'isWinner', value: false, index: i }));
        //this.players[i].isWinner = false;
        return resolve(true);
      }));
    }
    return Promise.all(promises_array);
  }

  public pickWinner() {
    //this.clearWinners().then(() => {
    //});
    //pick lowest HandRanks
    let max: number = Math.max.apply(Math, this.players.map((p) => { return p.handStats.handRank; }));
    let posibWinners = this.players.filter((p) => {
      return p.handStats.handRank == max;
    });

    //determine winner by lowest dices
    let posiWinners: WinnerModel[] = posibWinners.map((w) => {
      return new WinnerModel(w.hand.map((h) => { return h.faceRank }).reduce((a, b) => a + b), w);
    });

    let min: number = Math.min.apply(Math, posiWinners.map((w) => { return w.totalFaceCount; }));

    let winners = posibWinners.filter((p) => {
      return p.hand.map((h) => { return h.faceRank }).reduce((a, b) => a + b) == min;
    });

    winners.forEach((w) => {
      w.isWinner = true;
    })

    //disable all rerolls
    /*this.players.forEach((p) => {
      p.chances = 0;
    });*/

    this.gameOver = true;
  }

  public reset() {

    this.gameOver = false;

    this.store.dispatch(new reducers.ResetPlayers());

    this.initPlayers().then(() => {
      this.pickWinner();
    });

  }

  public close() {
    console.log(this.winref.nativeWindow);
    this.winref.nativeWindow.close();
  }


  /* CSS */
  public getCSSClass(cssInt: number): string {
    return cssInt == 1 ? "badge badge-danger" :
      cssInt == 2 ? "badge badge-dark" :
        cssInt == 3 ? "badge badge-info" :
          cssInt == 4 ? "badge badge-secondary" :
            cssInt == 5 ? "badge badge-success" :
              cssInt == 6 ? "badge badge-primary" :
                "badge";
  }

  /* determine hand type */

  public checks(hand: FaceDefinitionModel[]): Promise<HandTypeModel> {
    let faceRankArrayString = hand.map(x => x.faceRank).join(',');
    let handTypeModel: HandTypeModel = new HandTypeModel();
    let prom = new Promise<HandTypeModel>((resolve, reject) => {
      resolve(handTypeModel);
    });

    return this.checkFiveOfAKind(faceRankArrayString).then((resolve: boolean) => {

      if (resolve) {
        handTypeModel.handType = "Five of a kind";
        handTypeModel.handRank = 8;
        return prom;
      }

      return this.checkFourOfAKind(faceRankArrayString).then((resolve: boolean) => {

        if (resolve) {
          handTypeModel.handType = "Four of a kind";
          handTypeModel.handRank = 7;
          return prom;
        }

        return this.checkFullHouse(faceRankArrayString).then((resolve: boolean) => {
          if (resolve) {
            handTypeModel.handType = "Full house";
            handTypeModel.handRank = 6;
            return prom;
          }

          return this.checkStraight(faceRankArrayString).then((resolve: boolean) => {
            if (resolve) {
              handTypeModel.handType = "Straight";
              handTypeModel.handRank = 5;
              return prom;
            }

            return this.checkThreeOfAKind(faceRankArrayString).then((resolve: boolean) => {

              if (resolve) {
                handTypeModel.handType = "Three of a kind";
                handTypeModel.handRank = 4;
                return prom;
              }

              return this.checkTwoPair(faceRankArrayString).then((resolve: boolean) => {

                if (resolve) {
                  handTypeModel.handType = "Two pair";
                  handTypeModel.handRank = 3;
                  return prom;
                }

                return this.checkOnePair(faceRankArrayString).then((resolve: boolean) => {
                  if (resolve) {
                    handTypeModel.handType = "One pair";
                    handTypeModel.handRank = 2;
                    return prom;
                  }

                  handTypeModel.handType = "Bust";
                  handTypeModel.handRank = 1;
                  return prom;
                })
              })
            })
          })
        })
      })
    })


  }

  public checkAppearances(strArr: string, rank: number, num: number): boolean {
    let test = (strArr.split(rank.toString()).length - 1) === num;
    return test;
  }

  public checkFiveOfAKind(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return resolve(FaceModel.faces.some((i, index) => {
        return this.checkAppearances(faceRankArrayString, i.faceRank, 5);
      }));
    });
  }

  public checkFourOfAKind(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return resolve(FaceModel.faces.some((i, index) => {
        return this.checkAppearances(faceRankArrayString, i.faceRank, 4);
      }));
    });
  }


  public checkFullHouse(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let posibFullHouse = JSON.parse(JSON.stringify(FaceModel.faces));
      let three: boolean = false;
      //match 3 of a kind first
      let inde = null;
      three = posibFullHouse.some((i, index) => {
        let bool = this.checkAppearances(faceRankArrayString, i.faceRank, 3);
        if (bool) {
          inde = index;
        }
        return bool;
      });

      if (!three) return resolve(false);

      //remove found element
      posibFullHouse.splice(inde, 1);

      let two: boolean = false;
      //then match the pair
      two = posibFullHouse.some((i, index) => {
        return this.checkAppearances(faceRankArrayString, i.faceRank, 2);
      });

      return resolve(three && two);
    });
  }

  public checkStraight(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      for (var i = 0; i < FaceModel.faces.length; i++) {
        if (!this.checkAppearances(faceRankArrayString, FaceModel.faces[i].faceRank, 1)) {
          return resolve(false);
        }
      }
      return resolve(true);
    }
    );
  }

  public checkThreeOfAKind(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return resolve(FaceModel.faces.some((i, index) => {
        return this.checkAppearances(faceRankArrayString, i.faceRank, 3);
      }));
    });
  }

  public checkTwoPair(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let posibFullHouse = JSON.parse(JSON.stringify(FaceModel.faces));
      let first: boolean = false;
      //match 3 of a kind first
      let inde = null;
      first = posibFullHouse.some((i, index) => {
        let bool = this.checkAppearances(faceRankArrayString, i.faceRank, 2);
        if (bool) {
          inde = index;
        }
        return bool;
      });

      if (!first) return resolve(false);

      //remove found element
      posibFullHouse.splice(inde, 1);

      let two: boolean = false;
      //then match the pair
      two = posibFullHouse.some((i, index) => {
        return this.checkAppearances(faceRankArrayString, i.faceRank, 2);
      });

      return resolve(two && two);
    });
  }

  public checkOnePair(faceRankArrayString: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let v = FaceModel.faces.some((i, index) => {
        return this.checkAppearances(faceRankArrayString, i.faceRank, 2);
      });
      return resolve(v);
    });
  }




}
