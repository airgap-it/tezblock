import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { filter } from 'rxjs/operators'

import { TranslateService } from '@ngx-translate/core'
import { getRefresh } from '@tezblock/domain/synchronization'
import * as fromRoot from '@tezblock/reducers'
import * as actions from './app.actions'
import { AnalyticsService } from './services/analytics/analytics.service'
import defaultLanguage from './../assets/i18n/en.json'

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
    private readonly translate: TranslateService
  ) {
    this.loadLanguages(this.supportedLanguages)
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.store$.dispatch(actions.saveLatestRoute({ navigation: e as NavigationEnd })))

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

  loadLanguages(supportedLanguages: string[]) {
    this.translate.setTranslation('en', defaultLanguage)
    this.translate.setDefaultLang('en')

    const language = this.translate.getBrowserLang()

    if (language) {
      const lowerCaseLanguage = language.toLowerCase()
      supportedLanguages.forEach(supportedLanguage => {
        if (supportedLanguage.startsWith(lowerCaseLanguage)) {
          this.translate.use(supportedLanguage)
        }
      })
    } else {
      this.translate.use('en')
    }
  }

  public navigate(entity: string) {
    this.router.navigate([`${entity}/list`])
  }
  public ngOnInit() {
    this.analyticsService.init()
    this.loadLanguages(this.supportedLanguages)
  }
}
