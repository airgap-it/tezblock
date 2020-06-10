import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { filter } from 'rxjs/operators'

import { getRefresh } from '@tezblock/domain/synchronization'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './app.actions'
import { AnalyticsService } from './services/analytics/analytics.service'
import { LoadLanguagesService } from './services/translation/load-languages.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  supportedLanguages = ['en', 'de', 'zh-cn']

  constructor(
    private readonly actions$: Actions,
    readonly router: Router,
    private readonly store$: Store<fromRoot.State>,
    private readonly analyticsService: AnalyticsService,
    private readonly languageService: LoadLanguagesService
  ) {
    this.languageService.loadLanguages()
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.store$.dispatch(actions.saveLatestRoute({ navigation: <NavigationEnd>e })))

    getRefresh([
      this.actions$.pipe(ofType(actions.loadLatestBlockSucceeded)),
      this.actions$.pipe(ofType(actions.loadLatestBlockFailed))
    ]).subscribe(() => this.store$.dispatch(actions.loadLatestBlock())),
      this.store$.dispatch(actions.loadCryptoPriceFromCache())

    getRefresh([
      this.actions$.pipe(ofType(actions.loadCryptoPriceSucceeded)),
      this.actions$.pipe(ofType(actions.loadCryptoPriceFailed))
    ]).subscribe(() => this.store$.dispatch(actions.loadCryptoPrice())),
      this.store$.dispatch(actions.loadPeriodInfos())
    this.store$.dispatch(actions.loadProtocolVariables())
  }

  public navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }
  public ngOnInit() {
    this.analyticsService.init()
    this.languageService.loadLanguages()
  }
}
