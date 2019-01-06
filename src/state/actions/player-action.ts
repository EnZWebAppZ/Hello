import { Action } from '@ngrx/store';
import { NumState } from '../interface/num-state-interface';
import { PlayerState } from '../interface/player-state-interface';
import { SetPlayerProperties } from '../interface/set-player-properties';
import {PlayerLayoutPayload} from '../interface/player-layout-state-interface';

export const enum ActionTypes {
  SetNum = '[App Component] SetNum',
  PushPlayer = '[Poker Component] Push',
  ResetPlayers = '[Poker Component] Reset',
  UpdatePlayer = '[Poker Component] Update Player',
  InitializeLayout = '[Poker Component] Initialize Layout',
  RemoveLayout = '[Poker Component] Remove Layout'

}

export class SetNum implements Action {
  readonly type = ActionTypes.SetNum;
  constructor(public payload: NumState) { }
}

export class PushPlayer implements Action {
  readonly type = ActionTypes.PushPlayer;
  constructor(public payload: PlayerState) { }
}

export class ResetPlayers implements Action {
  readonly type = ActionTypes.ResetPlayers;
}

export class UpdatePlayer implements Action {
  readonly type = ActionTypes.UpdatePlayer;
    constructor(public payload: SetPlayerProperties) { }
}

export class InitializeLayout implements Action {
  readonly type = ActionTypes.InitializeLayout;
}

export class RemoveLayout implements Action {
  readonly type = ActionTypes.RemoveLayout;
    constructor(public payload: PlayerLayoutPayload) { }
}

export type ActionsUnion = SetNum | PushPlayer | ResetPlayers
 | UpdatePlayer | InitializeLayout | RemoveLayout;
 
