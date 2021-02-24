import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'

import { Wallet, SocialType, PlatformName } from '../../interfaces/Wallet'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  wallets: Wallet[] = [
    {
      title: this.translateService.instant('resources-wallets.airgap.title'),
      description: this.translateService.instant('resources-wallets.airgap.description'),
      logo: 'AirGap.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://airgap.it'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/AirGap_it'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/AirGap'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/airgap-it'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/airgap-it'
        }
      ],
      platforms: [
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://airgap.it#download'
        },
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://airgap.it#download'
        },
        {
          name: PlatformName.LinuxDistribution,
          icon: 'laptop',
          url: 'https://airgap.it#download'
        }
      ],
      features: [this.translateService.instant('resources-wallets.airgap.features')],
      downloadLink: 'https://airgap.it#download'
    },
    {
      title: this.translateService.instant('resources-wallets.atomic.title'),
      description: this.translateService.instant('resources-wallets.atomic.description'),
      logo: 'atomic_wallet.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://atomicwallet.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/atomicwallet'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/atomicwalletchat'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/atomic-wallet'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/Atomicwallet'
        }
      ],
      platforms: [
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://apps.apple.com/us/app/atomic-wallet/id1478257827'
        },
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=io.atomicwallet'
        },
        {
          name: PlatformName.LinuxDistribution,
          icon: 'laptop',
          url: 'https://atomicwallet.io/downloads'
        },
        {
          name: PlatformName.macOS,
          icon: 'laptop',
          url: 'https://atomicwallet.io/downloads'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://atomicwallet.io/downloads'
        }
      ],
      features: [this.translateService.instant('resources-wallets.atomic.features')],
      downloadLink: 'https://atomicwallet.io/downloads'
    },
    {
      title: this.translateService.instant('resources-wallets.atomex.title'),
      description: this.translateService.instant('resources-wallets.atomex.description'),
      logo: 'atomex.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://atomex.me/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/atomex_official'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/atomex_official'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/@_MisterWalker_'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/atomex-me/'
        }
      ],
      platforms: [
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.8/Atomex.Client.msi'
        }
      ],
      features: [this.translateService.instant('resources-wallets.atomex.features')],
      downloadLink: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.8/Atomex.Client.msi'
    },
    {
      title: this.translateService.instant('resources-wallets.galleon.title'),
      description: this.translateService.instant('resources-wallets.galleon.description'),
      logo: 'galleon.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://galleon-wallet.tech'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/CryptonomicTech'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/Cryptonomic'
        }
      ],
      platforms: [
        {
          name: PlatformName.macOS,
          icon: 'apple',
          url: 'https://cryptonomic-wallet.nyc3.digitaloceanspaces.com/release_0.9.0b/Galleon-0.9.0-b.dmg'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://cryptonomic-wallet.nyc3.digitaloceanspaces.com/release_0.9.0b/Galleon_0.9.0-b.msi'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://cryptonomic-wallet.nyc3.digitaloceanspaces.com/release_0.9.0b/galleon_0.9.0-b_amd64.deb'
        }
      ],
      features: [this.translateService.instant('resources-wallets.galleon.features')],
      downloadLink: 'https://galleon-wallet.tech'
    },
    {
      title: this.translateService.instant('resources-wallets.kukai.title'),
      description: this.translateService.instant('resources-wallets.kukai.description'),
      logo: 'kukai.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://kukai.app'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/KukaiWallet'
        },
        {
          type: SocialType.telegram,
          url: 'https://riot.im/app/#/room/#kukai:matrix.org'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/@KukaiWallet'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/kukai-wallet/kukai'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://kukai.app'
        }
      ],
      features: [this.translateService.instant('resources-wallets.kukai.features')],
      downloadLink: 'https://kukai.app'
    },
    {
      title: this.translateService.instant('resources-wallets.simplestacking.title'),
      description: this.translateService.instant('resources-wallets.simplestacking.description'),
      logo: 'simplestaking.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://simplestaking.com'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/simplestaking'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/simplestaking'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/simplestaking/wallet'
        }
      ],
      platforms: [
        {
          name: PlatformName.macOS,
          icon: 'apple',
          url: 'https://simplestaking.com'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://simplestaking.com'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://simplestaking.com'
        }
      ],
      features: [this.translateService.instant('resources-wallets.simplestacking.features')],
      downloadLink: 'https://simplestaking.com'
    }
  ]
  constructor(private translateService: TranslateService) {}

  get(): Observable<Wallet[]> {
    return of(this.wallets)
  }
}
