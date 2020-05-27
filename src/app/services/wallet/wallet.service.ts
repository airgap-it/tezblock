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
      title: this.translateService.instant('resources-wallets.cortez.title'),
      description: this.translateService.instant('resources-wallets.cortez.description'),
      logo: 'cortez.png',
      socials: [],
      platforms: [
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=com.tezcore.cortez'
        },
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://apps.apple.com/us/app/cortez/id1464922586'
        }
      ],
      features: [this.translateService.instant('resources-wallets.cortez.features')],
      downloadLink: 'https://play.google.com/store/apps/details?id=com.tezcore.cortez'
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
      logo: 'kukai.png',
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
          name: PlatformName.macOS,
          icon: 'apple',
          url: 'https://github.com/kukai-wallet/kukai/releases'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://github.com/kukai-wallet/kukai/releases'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://github.com/kukai-wallet/kukai/releases'
        }
      ],
      features: [this.translateService.instant('resources-wallets.kukai.features')],
      downloadLink: 'https://kukai.app'
    },
    {
      title: this.translateService.instant('resources-wallets.magnum.title'),
      description: this.translateService.instant('resources-wallets.magnum.description'),
      logo: 'magnum.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://app.magnumwallet.co'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/Magnum_Wallet'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/@Magnum_Wallet'
        }
      ],
      platforms: [
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=com.magnum.wallet'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://app.magnumwallet.co'
        },
        {
          name: PlatformName.macOS,
          icon: 'apple',
          url: 'https://app.magnumwallet.co'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://app.magnumwallet.co'
        }
      ],
      features: [this.translateService.instant('resources-wallets.magnum.features')],
      downloadLink: 'https://app.magnumwallet.co'
    },
    {
      title: this.translateService.instant('resources-wallets.paytomat.title'),
      description: this.translateService.instant('resources-wallets.paytomat.description'),
      logo: 'paytomat.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://paytomat.com/en/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/paytomat'
        },

        { type: SocialType.telegram, url: 'https://t.me/paytomat' },
        {
          type: SocialType.medium,
          url: 'https://medium.com/paytomat'
        },
        { type: SocialType.github, url: 'https://github.com/Paytomat' }
      ],
      platforms: [
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=com.paytomat'
        },
        { name: PlatformName.iOS, icon: 'apple', url: 'https://apps.apple.com/app/apple-store/id1415300709?mt=8' }
      ],
      features: [this.translateService.instant('resources-wallets.paytomat.features')],
      downloadLink: 'https://paytomat.com/en/wallet/'
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
    },
    {
      title: this.translateService.instant('resources-wallets.tezbox.title'),
      description: this.translateService.instant('resources-wallets.tezbox.description'),
      logo: 'TezBox.jpg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://tezbox.com/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/TezBox_Wallet'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/TezTechLabs'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/@officialtezbox'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/tezbox'
        }
      ],
      platforms: [
        {
          name: PlatformName.macOS,
          icon: 'apple',
          url: 'https://github.com/tezbox/desktop-wallet/releases/download/6.0.1/TezBox-Wallet_MacOS_6.0.1.dmg'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://github.com/tezbox/desktop-wallet/releases/download/6.0.1/TezBox_Winx64_6.0.1.exe'
        },
        {
          name: PlatformName.Android,
          icon: 'laptop',
          url: 'https://tezbox.com/'
        },
        {
          name: PlatformName.BrowserExtension,
          icon: 'laptop',
          url: 'https://tezbox.com/'
        }
      ],
      features: [this.translateService.instant('resources-wallets.tezbox.features')],
      downloadLink: 'https://galleon-wallet.tech'
    }
  ]
  constructor(private translateService: TranslateService) {}

  get(): Observable<Wallet[]> {
    return of(this.wallets)
  }
}
