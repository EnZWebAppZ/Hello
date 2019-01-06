import { Action } from '@ngrx/store';
import * as Actions from '../../../src/state/actions/player-action';
import { PlayerModel } from '../../models/player-model';
import { HandTypeModel } from '../../models/hand-type-model';
import * as Layouts from '../interface/player-layout-state-interface';

export const initialNum: number = 0;
export const initialPlayerState: PlayerModel[] = [];
export const initialLayout: Layouts.PlayerLayoutState = null;

export function playerNumReducer(state: number = initialNum,
  action: Actions.ActionsUnion) {
  switch (action.type) {

    case Actions.ActionTypes.SetNum:
      console.log('Number of players selected : ', action.payload.num);
      return action.payload.num;

    default:
      return state;
  }
}

export function playerLayoutReducer(state: Layouts.PlayerLayoutState = initialLayout,
  action: Actions.ActionsUnion) {
  switch (action.type) {

    case Actions.ActionTypes.InitializeLayout:
      let newArrC: Layouts.PlayerLayoutState = {
        colors: ["primary", "light", "dark", "danger", "success"],
        icons: ["arrow-right", "arrow-down", "arrow-left"]
      };
      console.log('Layout initialized', newArrC);
      return newArrC;

    case Actions.ActionTypes.RemoveLayout:
      let newArrCR: Layouts.PlayerLayoutState = {
        colors: state.colors.map((x) => x).filter((x) => x !== action.payload.color),
        icons: state.icons.map((x) => x).filter((x) => x !== action.payload.icon)
      };
      console.log('Layout Array spliced with color : ' + action.payload.color + ' and icon : '+ action.payload.icon, 
      newArrCR);
      return newArrCR;

    default:
      return state;
  }
}

export function playerReducer(state: PlayerModel[] = initialPlayerState,
  action: Actions.ActionsUnion) {
  switch (action.type) {

    case Actions.ActionTypes.PushPlayer:
      let newArr = [...state, action.payload.player];
      console.log('Player pushed', action.payload.player, newArr);
      return newArr;

    case Actions.ActionTypes.ResetPlayers:
      let newArr2: PlayerModel[] = [];
      console.log('Players reseted', newArr2);
      return newArr;

    case Actions.ActionTypes.UpdatePlayer:
      let playerModel = state.map(
        (player, i) => {
          if (i === action.payload.index) {
            player[action.payload.key] = action.payload.value;
            return player;
          }
          else {
            return player;
          }
        }
      );

      console.log('Updated Player\'s ' + action.payload.key + ' : ', playerModel[action.payload.index]);
      return playerModel;

    default:
      return state;
  }
}

