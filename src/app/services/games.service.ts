import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TicTacToeDTO} from '../request-bodies/tic-tac-toe-d-t-o';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Router} from '@angular/router';

export interface TicTacToeGameDTOResponse {
  gameId: number;
  created: Date;
  firstPlayer: string;
  secondPlayer: string;
  firstPlayerPieceCode: string;
  gameType: string;
  gameStatus: string;
}

const httpHeaders: HttpHeaders = new HttpHeaders({
  'Content-Type': 'application/json'
});

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private http: HttpClient,
              private router: Router) {
  }

  createGame(gameDto: TicTacToeDTO): Observable<TicTacToeGameDTOResponse> {
    return this.http.post<TicTacToeGameDTOResponse>('games/tictactoe', gameDto, {headers: httpHeaders}).pipe(
      tap(res => {
        console.log('User has created new game', res);

        this.router.navigate([`/games/tic-tac-toe/${res.gameId}`]).then(
          () => {
            console.log(`Navigating to '/games/tic-tac-toe/${res.gameId}'`);
          },
          reason => {
            console.error(`Navigating to '/games/tic-tac-toe/${res.gameId}' failed`, reason);
          });
      }),
      catchError(err => {
        console.error(`User couldn't create new game`, err);
        return throwError(err);
      })
    );
  }

  getAvailableGames(): Observable<TicTacToeGameDTOResponse[]> {
    return this.http.get<TicTacToeGameDTOResponse[]>('games/tictactoe/list');
  }

  getUserActiveGames(): Observable<TicTacToeGameDTOResponse[]> {
    return this.http.get<TicTacToeGameDTOResponse[]>('games/tictactoe/games/active').pipe(
      tap(res => {
        if (res && res.length > 0) {
          console.log('User has active game pending');

          this.router.navigate([`/games/tic-tac-toe/${res[0].gameId}`]).then(
            () => {
              console.log(`Navigating to '/games/tic-tac-toe/${res[0].gameId}'`);
            },
            reason => {
              console.error(`Navigating to '/games/tic-tac-toe/${res[0].gameId}' failed`, reason);
            });
        }
      })
    );
  }
}
