import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {SessionStorageService} from './services/session-storage.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {AuthService} from './services/auth.service';
import {Subscription} from 'rxjs';
import {StompService} from './services/stomp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  username: string;
  isLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  private mobileQueryListener;
  private logged: Subscription;
  private stompErrors: Subscription;

  constructor(private sessionStorage: SessionStorageService,
              private changeDetectorRef: ChangeDetectorRef,
              private media: MediaMatcher,
              private auth: AuthService,
              private stomp: StompService) {
  }

  ngOnInit() {
    this.stompErrors = this.stomp.getConnectionErrors().subscribe(
      () => {
        this.stomp.disconnect();
        if (this.auth.isLoggedIn()) {
          this.auth.logout();
        }
      }
    );

    this.onLogged(this.auth.isLoggedIn());

    this.logged = this.auth.logged$.subscribe(
      logged => {
        this.onLogged(logged);
      });

    this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('mobileQueryListener', this.mobileQueryListener());
  }

  ngOnDestroy() {
    this.mobileQuery.removeEventListener('mobileQueryListener', this.mobileQueryListener());
    this.logged.unsubscribe();
    this.stomp.disconnect();
    this.stomp.getConnectionErrors();
  }

  private onLogged(logged: boolean) {
    this.isLoggedIn = logged;
    this.isAdminLoggedIn = this.auth.isAdminLoggedIn();

    if (this.isLoggedIn) {
      this.username = this.sessionStorage.getUsername();
      this.stomp.connect();
    } else {
      this.username = 'User';
      this.stomp.disconnect();
    }
  }
}
