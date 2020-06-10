import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import English from '../../../assets/i18n/en.json'
import German from '../../../assets/i18n/de.json'

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  supportedLanguages = ['en', 'de', 'zh-cn']

  languages = {
    en: English,
    de: German
  }

  constructor(private readonly translate: TranslateService) {}

  loadLanguages(translateTo?: string) {
    let language = 'en'
    translateTo
      ? this.supportedLanguages.includes(translateTo.toLowerCase())
        ? (language = translateTo.toLowerCase())
        : (language = this.translate.getBrowserLang())
      : (language = this.translate.getBrowserLang())

    this.translate.setTranslation(language, this.languages[language])
    this.translate.setDefaultLang('en')

    if (language) {
      this.supportedLanguages.filter(supportedLanguage =>
        supportedLanguage.startsWith(language.toLowerCase()) ? this.translate.use(supportedLanguage) : null
      )
    }
  }
}
