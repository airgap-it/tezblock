import { Pipe, PipeTransform } from '@angular/core'
import { findIconDefinition, IconDefinition, IconLookup, IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { environment } from 'src/environments/environment'

export type IconRef =
  | 'bell'
  | 'copy'
  | 'levelDownAlt'
  | 'levelUpAlt'
  | 'longArrowAltDown'
  | 'qrcode'
  | 'search'
  | 'exchangeAlt'
  | 'link'
  | 'stamp'
  | 'eye'
  | 'handReceiving'
  | 'boxBallot'
  | 'handHoldingSeedling'
  | 'github'
  | 'medium'
  | 'telegram'
  | 'twitter'
  | 'globe'
  | 'apple'
  | 'laptop'
  | 'android'
  | 'CaretUp'
  | 'CaretDown'

@Pipe({
  name: 'iconPipe'
})
export class IconPipe implements PipeTransform {
  private readonly iconNameMap: Record<IconRef, IconLookup>

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
      bell: { prefix, iconName: 'bell' },
      copy: { prefix, iconName: 'copy' },
      levelDownAlt: { prefix, iconName: 'level-down-alt' },
      levelUpAlt: { prefix, iconName: 'level-up-alt' },
      longArrowAltDown: { prefix, iconName: 'long-arrow-alt-down' },
      qrcode: { prefix, iconName: 'qrcode' },
      search: { prefix, iconName: 'search' },
      exchangeAlt: { prefix, iconName: 'exchange-alt' },
      link: { prefix, iconName: 'link' },
      stamp: { prefix, iconName: 'stamp' },
      eye: { prefix, iconName: 'eye' },
      handReceiving: { prefix, iconName: handReceiving },
      boxBallot: { prefix, iconName: boxBallot },
      handHoldingSeedling: { prefix, iconName: handHoldingSeedling },
      github: { prefix: 'fab', iconName: 'github' },
      medium: { prefix: 'fab', iconName: 'medium' },
      telegram: { prefix: 'fab', iconName: 'telegram' },
      twitter: { prefix: 'fab', iconName: 'twitter' },
      globe: { prefix, iconName: 'globe' },
      laptop: { prefix, iconName: 'laptop' },
      apple: { prefix: 'fab', iconName: 'apple' },
      android: { prefix: 'fab', iconName: 'android' },
      CaretUp: { prefix, iconName: 'caret-up' },
      CaretDown: { prefix, iconName: 'caret-down' }
    }
  }

  public iconDefinition(name: IconRef): IconDefinition {
    return findIconDefinition(this.iconNameMap[name])
  }

  public transform(value: IconRef): string[] {
    const icon = this.iconNameMap[value]

    return [icon.prefix, icon.iconName]
  }
}
