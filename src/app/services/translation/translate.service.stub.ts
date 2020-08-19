import { Observable, of } from 'rxjs'

export class TranslateServiceStub {
  public get<T>(key: T): Observable<T> {
    return of(key)
  }

  public getBrowserLang() {
    return 'en'
  }

  public setDefaultLang(language) {}

  public get currentLang() {
    return 'en'
  }

  public instant(key) {
    return 'value'
  }

  public use(lang) {}
}
