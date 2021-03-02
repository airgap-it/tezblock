import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'

import { EcosystemItem, SocialType, PlatformName, EcosystemCategory } from '../../interfaces/Ecosystem'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class EcosystemService {
  ecosystem: EcosystemItem[] = [
    {
      title: this.translateService.instant('ecosystem-wallets.airgap.title'),
      description: this.translateService.instant('ecosystem-wallets.airgap.description'),
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
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://github.com/airgap-it/airgap-wallet/releases'
        },
        {
          name: PlatformName.macOS,
          icon: 'laptop',
          url: 'https://github.com/airgap-it/airgap-wallet/releases'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://github.com/airgap-it/airgap-wallet/releases'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.airgap.features')],
      downloadLink: 'https://airgap.it#download',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.atomic.title'),
      description: this.translateService.instant('ecosystem-wallets.atomic.description'),
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
      features: [this.translateService.instant('ecosystem-wallets.atomic.features')],
      downloadLink: 'https://atomicwallet.io/downloads',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.atomex.title'),
      description: this.translateService.instant('ecosystem-wallets.atomex.description'),
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
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://wallet.atomex.me/'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.8/Atomex.Client.msi'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.48/Atomex_1.0.0_amd64.deb'
        },
        {
          name: PlatformName.macOS,
          icon: 'laptop',
          url: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.52/Atomex-1.0.0.dmg'
        },
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://apps.apple.com/us/app/atomex-wallet-dex/id1534717828'
        },
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=com.atomex.android'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.atomex.features')],
      downloadLink: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.8/Atomex.Client.msi',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.galleon.title'),
      description: this.translateService.instant('ecosystem-wallets.galleon.description'),
      logo: 'galleon.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://cryptonomic.tech/galleon.html'
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
      features: [this.translateService.instant('ecosystem-wallets.galleon.features')],
      downloadLink: 'https://cryptonomic.tech/galleon.html',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.kukai.title'),
      description: this.translateService.instant('ecosystem-wallets.kukai.description'),
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
          url: 'https://t.me/KukaiWallet'
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
      features: [this.translateService.instant('ecosystem-wallets.kukai.features')],
      downloadLink: 'https://kukai.app',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.ledger.title'),
      description: this.translateService.instant('ecosystem-wallets.ledger.description'),
      logo: 'ledger.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://www.ledger.com/ledger-live'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/Ledger'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/LedgerHQ'
        }
      ],
      platforms: [
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://itunes.apple.com/app/id1361671700'
        },
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=com.ledger.live'
        },
        {
          name: PlatformName.Windows,
          icon: 'laptop',
          url: 'https://download-live.ledger.com/releases/latest/download/win'
        },
        {
          name: PlatformName.macOS,
          icon: 'laptop',
          url: 'https://download-live.ledger.com/releases/latest/download/mac'
        },
        {
          name: PlatformName.Linux,
          icon: 'laptop',
          url: 'https://download-live.ledger.com/releases/latest/download/linux'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.ledger.features')],
      downloadLink: 'https://www.ledger.com/ledger-live',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.magma.title'),
      description: this.translateService.instant('ecosystem-wallets.magma.description'),
      logo: 'magma.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://magmawallet.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/MagmaWallet'
        },
        {
          type: SocialType.medium,
          url: 'https://camlcase.io/blog'
        },
        {
          type: SocialType.github,
          url: 'https://gitlab.com/camlcase-dev/'
        }
      ],
      platforms: [
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://apps.apple.com/app/id1512745852#?platform=iphone'
        },
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=io.camlcase.smartwallet'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.magma.features')],
      downloadLink: 'https://magmawallet.io/',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.simplestaking.title'),
      description: this.translateService.instant('ecosystem-wallets.simplestaking.description'),
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
      features: [this.translateService.instant('ecosystem-wallets.simplestaking.features')],
      downloadLink: 'https://simplestaking.com',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.spire.title'),
      description: this.translateService.instant('ecosystem-wallets.spire.description'),
      logo: 'spire.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://spirewallet.com/'
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
          url: 'https://github.com/airgap-it/spire'
        }
      ],
      platforms: [
        {
          name: PlatformName.BrowserExtension,
          icon: 'globe',
          url: 'https://spirewallet.com/#download'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.spire.features')],
      downloadLink: 'https://templewallet.com/download',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.temple.title'),
      description: this.translateService.instant('ecosystem-wallets.temple.description'),
      logo: 'temple.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://templewallet.com/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/madfishofficial'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/MadFishCommunity'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/madfish-solutions'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/madfish-solutions/templewallet-extension'
        }
      ],
      platforms: [
        {
          name: PlatformName.BrowserExtension,
          icon: 'globe',
          url: 'https://templewallet.com/download'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.temple.features')],
      downloadLink: 'https://templewallet.com/download',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-wallets.trust-wallet.title'),
      description: this.translateService.instant('ecosystem-wallets.trust-wallet.description'),
      logo: 'trust-wallet.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://trustwallet.com/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/trustwalletapp'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/trust_announcements'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/madfish-solutions'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/trustwallet'
        }
      ],
      platforms: [
        {
          name: PlatformName.iOS,
          icon: 'apple',
          url: 'https://apps.apple.com/app/apple-store/id1288339409?pt=1324988&ct=website&mt=8'
        },
        {
          name: PlatformName.Android,
          icon: 'android',
          url: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp&referrer=utm_source%3Dwebsite'
        }
      ],
      features: [this.translateService.instant('ecosystem-wallets.trust-wallet.features')],
      downloadLink: 'https://trustwallet.com/',
      category: EcosystemCategory.wallet
    },
    {
      title: this.translateService.instant('ecosystem-dapps.dexter.title'),
      description: this.translateService.instant('ecosystem-dapps.dexter.description'),
      logo: 'dexter.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://dexter.exchange/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/DexterExchange'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://dexter.exchange/'
        }
      ],
      features: [this.translateService.instant('ecosystem-dapps.dexter.features')],
      downloadLink: 'https://dexter.exchange/',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-dapps.kolibri.title'),
      description: this.translateService.instant('ecosystem-dapps.kolibri.description'),
      logo: 'kolibri.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://kolibri.finance/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/HoverEng'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://kolibri.finance/'
        }
      ],
      features: [this.translateService.instant('ecosystem-dapps.kolibri.features')],
      downloadLink: 'https://kolibri.finance/',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-dapps.openminter.title'),
      description: this.translateService.instant('ecosystem-dapps.openminter.description'),
      logo: 'openminter.svg',
      socials: [
        {
          type: SocialType.github,
          url: 'https://github.com/tqtezos/minter'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://github.com/tqtezos/minter'
        }
      ],
      features: [this.translateService.instant('ecosystem-dapps.openminter.features')],
      downloadLink: 'https://github.com/tqtezos/minter',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-dapps.tzbutton.title'),
      description: this.translateService.instant('ecosystem-dapps.tzbutton.description'),
      logo: 'tzbutton.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://tzbutton.io/'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/tzbutton/tzbutton'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://tzbutton.io/'
        }
      ],
      features: [this.translateService.instant('ecosystem-dapps.tzbutton.features')],
      downloadLink: 'https://tzbutton.io/',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-dapps.tzcolors.title'),
      description: this.translateService.instant('ecosystem-dapps.tzcolors.description'),
      logo: 'tzcolors.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://tzcolors.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/tzcolors'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/tzcolors'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/tzcolors/tzcolors'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://tzcolors.io/'
        }
      ],
      features: [this.translateService.instant('ecosystem-dapps.tzcolors.features')],
      downloadLink: 'https://tzcolors.io/',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-dapps.tezos-domains.title'),
      description: this.translateService.instant('ecosystem-dapps.tezos-domains.description'),
      logo: 'tezos-domains.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://tezos.domains/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/tezosdomains'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/tezos-name-service'
        },
        {
          type: SocialType.github,
          url: 'https://gitlab.com/tezos-domains'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://tezos.domains/'
        }
      ],
      features: [this.translateService.instant('ecosystem-dapps.tezos-domains.features')],
      downloadLink: 'https://tezos.domains/',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-dapps.tezex.title'),
      description: this.translateService.instant('ecosystem-dapps.tezex.description'),
      logo: 'tezex.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://tezex.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/tezosexchange'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/tezexofficial'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/tezosexchange'
        }
      ],
      platforms: [
        {
          name: PlatformName.Web,
          icon: 'globe',
          url: 'https://tezex.io/'
        }
      ],
      features: [this.translateService.instant('ecosystem-libraries.tezex.features')],
      downloadLink: 'https://tezex.io/',
      category: EcosystemCategory.dapp
    },
    {
      title: this.translateService.instant('ecosystem-libraries.beacon.title'),
      description: this.translateService.instant('ecosystem-libraries.beacon.description'),
      logo: 'beacon.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://walletbeacon.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/AirGap_it'
        },
        {
          type: SocialType.medium,
          url: 'https://medium.com/airgap-it'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/airgap-it/beacon-sdk'
        }
      ],
      platforms: [],
      features: [this.translateService.instant('ecosystem-libraries.beacon.features')],
      downloadLink: 'https://walletbeacon.io/',
      category: EcosystemCategory.library
    },
    {
      title: this.translateService.instant('ecosystem-libraries.ligo.title'),
      description: this.translateService.instant('ecosystem-libraries.ligo.description'),
      logo: 'ligo.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://ligolang.org/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/ligolang'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/LigoLang'
        },
        {
          type: SocialType.github,
          url: 'https://gitlab.com/ligolang/ligo'
        }
      ],
      platforms: [],
      features: [this.translateService.instant('ecosystem-libraries.ligo.features')],
      downloadLink: 'https://ligolang.org/',
      category: EcosystemCategory.library
    },
    {
      title: this.translateService.instant('ecosystem-libraries.pytezos.title'),
      description: this.translateService.instant('ecosystem-libraries.pytezos.description'),
      logo: 'pytezos.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://pytezos.org/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/TezosBakingBad'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/baking_bad_chat'
        },
        {
          type: SocialType.medium,
          url: 'https://baking-bad.org/blog/'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/baking-bad/pytezos'
        }
      ],
      platforms: [],
      features: [this.translateService.instant('ecosystem-libraries.pytezos.features')],
      downloadLink: 'https://pytezos.org/',
      category: EcosystemCategory.library
    },
    {
      title: this.translateService.instant('ecosystem-libraries.smartpy.title'),
      description: this.translateService.instant('ecosystem-libraries.smartpy.description'),
      logo: 'smartpy.svg',
      socials: [
        {
          type: SocialType.website,
          url: 'https://smartpy.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/SmartPy_io'
        },
        {
          type: SocialType.telegram,
          url: 'https://t.me/SmartPy_io'
        },
        {
          type: SocialType.github,
          url: 'https://gitlab.com/SmartPy/smartpy'
        }
      ],
      platforms: [],
      features: [this.translateService.instant('ecosystem-libraries.smartpy.features')],
      downloadLink: 'https://smartpy.io/',
      category: EcosystemCategory.library
    },
    {
      title: this.translateService.instant('ecosystem-libraries.taquito.title'),
      description: this.translateService.instant('ecosystem-libraries.taquito.description'),
      logo: 'taquito.png',
      socials: [
        {
          type: SocialType.website,
          url: 'https://tezostaquito.io/'
        },
        {
          type: SocialType.twitter,
          url: 'https://twitter.com/TezosTaquito'
        },
        {
          type: SocialType.github,
          url: 'https://github.com/ecadlabs/taquito'
        }
      ],
      platforms: [],
      features: [this.translateService.instant('ecosystem-libraries.taquito.features')],
      downloadLink: 'https://tezostaquito.io/',
      category: EcosystemCategory.library
    }
  ]
  constructor(private translateService: TranslateService) {}

  get(): Observable<EcosystemItem[]> {
    return of(this.ecosystem)
  }
}
