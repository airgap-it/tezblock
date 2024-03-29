import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class TranslateServiceStub {
  public get<T>(key: T): Observable<T> {
    return of(key);
  }

  public getBrowserLang() {
    return 'en';
  }

  public setDefaultLang(language) {}

  public get currentLang() {
    return 'en';
  }

  public instant(key) {
    return 'value';
  }

  public use(lang) {}

  public onLangChange = new EventEmitter<any>();
  public onTranslationChange = new EventEmitter<any>();
  public onDefaultLangChange = new EventEmitter<any>();
  public addLangs(langs: string[]) {
    return;
  }
  public getLangs() {
    return ['en-us'];
  }
  public getBrowserCultureLang() {
    return '';
  }
}
