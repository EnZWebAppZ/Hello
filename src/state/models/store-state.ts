import * as reducers from '../reducers/poker-reducer';

export class StoreState {
  num : any = reducers.playerNumReducer;
  players : any = reducers.playerReducer;
  layouts : any = reducers.playerLayoutReducer;
}
