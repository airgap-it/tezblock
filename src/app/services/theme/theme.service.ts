import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/common'

import { CacheService, CacheKeys } from '@tezblock/services/cache/cache.service'
import { BeaconService } from '../beacon/beacon.service'
import { ColorMode } from '@airgap/beacon-sdk'

export enum Theme {
  light = 'light',
  dark = 'dark'
}

const defaultTheme = Theme.light

const toClassName = (theme: Theme): string => `${theme}-theme`

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly cacheService: CacheService,
    private readonly beaconService: BeaconService
  ) {}

  switch() {
    const currentTheme: Theme = this.getTheme()
    const newTheme = currentTheme ? (currentTheme === Theme.light ? Theme.dark : Theme.light) : defaultTheme

    this.beaconService.changeTheme(newTheme === 'light' ? ColorMode.LIGHT : ColorMode.DARK)

    this.updateDocumentClass(newTheme)
    this.cacheService.set(CacheKeys.theme, newTheme).subscribe(() => {})
  }

  getTheme() {
    const htmlClass = this.document.documentElement.className
    return htmlClass.indexOf(toClassName(Theme.light)) !== -1
      ? Theme.light
      : htmlClass.indexOf(toClassName(Theme.dark)) !== -1
      ? Theme.dark
      : undefined
  }

  isDarkMode() {
    return this.getTheme() === Theme.dark
  }

  isLightMode() {
    return this.getTheme() === Theme.light
  }

  setTheme(): Promise<any> {
    return new Promise((resolve) => {
      this.cacheService.get<string>(CacheKeys.theme).subscribe(
        (theme) => {
          this.updateDocumentClass(theme ? Theme[theme] : defaultTheme)

          const beaconTheme = theme ? Theme[theme] : defaultTheme
          this.beaconService.changeTheme(beaconTheme === 'light' ? ColorMode.LIGHT : ColorMode.DARK)

          if (!theme) {
            this.cacheService.set(CacheKeys.theme, defaultTheme).subscribe(() => {
              resolve()
            })
            return
          }
          resolve()
        },
        (/* error */) => resolve()
      )
    })
  }

  private updateDocumentClass(theme: Theme) {
    this.document.documentElement.className =
      this.document.documentElement.className.replace(toClassName(Theme.light), '').replace(toClassName(Theme.dark), '').trim() +
      ` ${toClassName(theme)}`
  }
}
