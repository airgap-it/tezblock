import { Pipe, PipeTransform } from '@angular/core';
import {
  findIconDefinition,
  IconDefinition,
  IconLookup,
  IconName,
  IconPrefix,
} from '@fortawesome/fontawesome-svg-core';
import { environment } from 'src/environments/environment';

export type IconRef =
  | 'bell'
  | 'copy'
  | 'levelDownAlt'
  | 'levelUpAlt'
  | 'longArrowAltDown'
  | 'longArrowAltUp'
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
  | 'caretUp'
  | 'caretDown'
  | 'breadLoaf'
  | 'coin'
  | 'coins'
  | 'hatChef'
  | 'infoCircle'
  | 'website'
  | 'download'
  | 'fileUpload'
  | 'binoculars'
  | 'hammer'
  | 'graduationCap'
  | 'circle'
  | 'chevronLeft'
  | 'chevronRight'
  | 'expand'
  | 'thumbsUp'
  | 'thumbsDown'
  | 'handRock'
  | 'check'
  | 'times'
  | 'cog'
  | 'externalLink'
  | 'discord';

@Pipe({
  name: 'iconPipe',
})
export class IconPipe implements PipeTransform {
  private readonly iconNameMap: Record<IconRef, IconLookup>;

  constructor() {
    let prefix: IconPrefix = 'fal';
    let handReceiving: IconName = 'hand-receiving';
    let boxBallot: IconName = 'box-ballot';
    let handHoldingSeedling: IconName = 'hand-holding-seedling';
    let coin: IconName = 'coin';
    let hatChef: IconName = 'hat-chef';
    let infoCircle: IconName = 'info-circle';
    let breadLoaf: IconName = 'bread-loaf';
    let externalLink: IconName = 'link';
    if (!environment.proFontAwesomeAvailable) {
      prefix = 'fas';
      handReceiving = 'handshake';
      boxBallot = 'vote-yea';
      handHoldingSeedling = 'seedling';
      coin = 'coins';
      hatChef = 'list-alt';
      infoCircle = 'info';
      breadLoaf = 'bread-slice';
      externalLink = 'external-link';
    }
    this.iconNameMap = {
      bell: { prefix, iconName: 'bell' },
      copy: { prefix, iconName: 'copy' },
      levelDownAlt: { prefix, iconName: 'level-down-alt' },
      levelUpAlt: { prefix, iconName: 'level-up-alt' },
      longArrowAltDown: { prefix, iconName: 'long-arrow-alt-down' },
      longArrowAltUp: { prefix, iconName: 'long-arrow-alt-up' },
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
      caretUp: { prefix, iconName: 'caret-up' },
      caretDown: { prefix, iconName: 'caret-down' },
      breadLoaf: { prefix, iconName: breadLoaf },
      coin: { prefix, iconName: coin },
      hatChef: { prefix, iconName: hatChef },
      infoCircle: { prefix, iconName: infoCircle },
      website: { prefix, iconName: 'globe' },
      download: { prefix, iconName: 'download' },
      fileUpload: { prefix, iconName: 'file-upload' },
      binoculars: { prefix, iconName: 'binoculars' },
      hammer: { prefix, iconName: 'hammer' },
      graduationCap: { prefix, iconName: 'graduation-cap' },
      circle: { prefix, iconName: 'circle' },
      chevronLeft: { prefix, iconName: 'chevron-left' },
      chevronRight: { prefix, iconName: 'chevron-right' },
      expand: { prefix, iconName: 'expand' },
      coins: { prefix, iconName: 'coins' },
      thumbsUp: { prefix, iconName: 'thumbs-up' },
      thumbsDown: { prefix, iconName: 'thumbs-down' },
      handRock: { prefix, iconName: 'hand-rock' },
      check: { prefix, iconName: 'check' },
      times: { prefix, iconName: 'times' },
      cog: { prefix, iconName: 'cog' },
      externalLink: { prefix, iconName: externalLink },
      discord: { prefix: 'fab', iconName: 'discord' },
    };
  }

  public iconDefinition(name: IconRef): IconDefinition {
    return findIconDefinition(this.iconNameMap[name]);
  }

  public transform(value: IconRef): string[] {
    const icon = this.iconNameMap[value];

    return [icon.prefix, icon.iconName];
  }
}
