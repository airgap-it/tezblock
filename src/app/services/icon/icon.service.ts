import { Injectable } from '@angular/core'
import { IconDefinition, findIconDefinition, IconLookup, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'
import { environment } from './../../../environments/environment'

export type IconRef = 'copy' | 
'levelDownAlt' | 
'levelUpAlt' | 
'longArrowAltDown' | 
'qrcode' | 
'search' | 
'exchangeAlt' | 
'link' | 
'stamp' | 
'eye' |
'handReceiving' |
'boxBallot' |
'handHoldingSeedling' |
'github' |
'medium' |
'telegram' |
'twitter'

@Injectable({
  providedIn: 'root'
})
export class IconService {

  private iconNameMap: Record<IconRef, IconLookup>

  constructor() {
    let prefix: IconPrefix = 'fal'
    let handReceiving: IconName = 'hand-receiving'
    let boxBallot: IconName = 'box-ballot'
    let handHoldingSeedling: IconName = 'hand-holding-seedling'
    if (!environment.proFontAwesomeAvailable) {
      prefix = 'fas'
      handReceiving = 'handshake'
      boxBallot = 'vote-yea'
      handHoldingSeedling = 'seedling'
    }
    this.iconNameMap = {
      'copy': { prefix: prefix, iconName: 'copy' },
      'levelDownAlt': { prefix: prefix, iconName: 'level-down-alt' },
      'levelUpAlt': { prefix: prefix, iconName: 'level-up-alt' },
      'longArrowAltDown': { prefix: prefix, iconName: 'long-arrow-alt-down' },
      'qrcode': { prefix: prefix, iconName: 'qrcode' },
      'search': { prefix: prefix, iconName: 'search' },
      'exchangeAlt': { prefix: prefix, iconName: 'exchange-alt' },
      'link': { prefix: prefix, iconName: 'link' },
      'stamp': { prefix: prefix, iconName: 'stamp' },
      'eye': { prefix: prefix, iconName: 'eye' },
      'handReceiving': {prefix: prefix, iconName: handReceiving},
      'boxBallot': { prefix: prefix, iconName: boxBallot },
      'handHoldingSeedling': { prefix: prefix, iconName: handHoldingSeedling },
      'github': { prefix: 'fab', iconName: 'github' },
      'medium': { prefix: 'fab', iconName: 'medium' },
      'telegram': { prefix: 'fab', iconName: 'telegram' },
      'twitter': { prefix: 'fab', iconName: 'twitter' }
    }
  }

  public iconDefinition(name: IconRef): IconDefinition {
    return findIconDefinition(this.iconLookup(name))
  }

  public iconLookup(name: IconRef): IconLookup {
    return this.iconNameMap[name]
  }

  public iconProperties(name: IconRef): string[] {
    const icon = this.iconLookup(name)
    return [icon.prefix, icon.iconName]
  }
}