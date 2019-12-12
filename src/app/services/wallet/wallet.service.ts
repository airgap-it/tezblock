import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { Facade } from '../facade/facade'
import { Wallet, SocialType, PlatformName } from '../../interfaces/Wallet'

const initialState: Wallet[] = [
  {
    title: 'AirGap',
    description: `With AirGap your old smartphone is your new ‘hardware wallet’. Securely store your XTZ with the unique two device approach where one device is completely offline, delegate your Tezzies from cold storage and earn rewards. AirGap's focus is on accessible security, providing best in class security while maintaing a great user experience.`,
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
    features: [
      'Offline device',
      'Highest security',
      'XTZ delegation',
      'Coin agnostic',
      'Secure storage',
      'Social recovery',
      'Hot wallet option'
    ],
    downloadLink: 'https://airgap.it#download'
  },
  {
    title: 'Atomex',
    description: `Multicurrency HD wallet with built-in hybrid atomic swap exchange.`,
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
    features: ['HD wallet', 'built-in hybrid atomic swap DEX'],
    downloadLink: 'https://github.com/atomex-me/atomex.client.wpf/releases/download/v1.0.8/Atomex.Client.msi'
  },
  {
    title: 'Cortez',
    description: `Mobile wallet developed by Nomadic Labs.`,
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
    features: ['Mobile'],
    downloadLink: 'https://play.google.com/store/apps/details?id=com.tezcore.cortez'
  },
  {
    title: 'Galleon',
    description: `Galleon a smart wallet for Tezos. Galleon is a deployment of Tezori, an open source wallet framework for Tezos, supporting both software and hardware wallets in eight languages on Mac, Windows, and Linux.`,
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
    features: ['Ledger Support', 'Delegation'],
    downloadLink: 'https://galleon-wallet.tech'
  },
  {
    title: 'Kukai',
    description: `One of the first Tezos wallet with offline-signing, KT backward compatibility and ledger support. Kukai is available in 6 different languages thanks to the Tezos community efforts. The wallet has been audited by one of the leading security audit German firm. Kukai guarantees full anonymity as there is no tracking, cookies or analytics in our wallet.`,
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
    features: ['Ledger Support', 'Delegation', 'offline-signing'],
    downloadLink: 'https://kukai.app'
  },
  {
    title: 'Magnum Wallet',
    description: `Magnum Wallet is a multicurrency non-custodial wallet service. Designed for those who wish to manage their crypto portfolio in a secure and convenient interface, it also lets the user earn rewards through staking or by claiming forks and bounty airdrops. As part of their “Multiply Your Funds” paradigm, the team is always on the lookout for new ways to benefit the users.`,
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
    features: ['Blockchain Agnostic', 'In-App Exchange', 'Hardware Wallets', 'Ultimate Security', 'Passive Income', 'Forks & Bounties'],
    downloadLink: 'https://app.magnumwallet.co'
  },
  {
    title: 'simplestaking.com',
    description: `Safe way to store & stake Tezos. Desktop & Web wallet with Trezor support.`,
    logo: 'simplestaking.png',
    socials: [
      {
        type: SocialType.website,
        url: 'https://simplestkaing.com'
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
    features: ['Trezor T', 'multiple wallets', 'wallet balance history'],
    downloadLink: 'https://simplestaking.com'
  },
  {
    title: 'TezBox',
    description: `TezBox was the earliest functional GUI wallet for Tezos. TezBox has grown to be one of the major community developed wallets and will continue to provide users and developers with an easy to use, powerful and secure wallet.`,
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
    features: ['Secure', 'Mobile', 'Developer Friendly', 'Open Source', 'Hardware Wallet Support'],
    downloadLink: 'https://galleon-wallet.tech'
  }
]

@Injectable({
  providedIn: 'root'
})
export class WalletService extends Facade<Wallet[]> {
  constructor() {
    super(initialState)
  }

  get(): Observable<Wallet[]> {
    return this.state$
  }
}
