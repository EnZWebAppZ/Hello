import { Component } from '@angular/core';
import { PokerComponent } from './poker.component';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as reducers from '../state/actions/player-action';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles: [`.some-margin{  margin-top : 30px;}`]
})
export class AppComponent {

  players: number = 2;

  showGame: boolean = false;

  num$: Observable<number>;

  constructor(private store: Store<{ num: number }>) {
    this.num$ = store.pipe(select('num'));
  }

  public play() {
    this.store.dispatch(new reducers.SetNum({num : this.players}));
    this.showGame = true;
  }

  public keypress(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }



}
