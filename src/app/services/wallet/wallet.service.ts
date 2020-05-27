import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'

import { Wallet, SocialType, PlatformName } from '../../interfaces/Wallet'

const wallets: Wallet[] = [
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
    title: 'Atomic Wallet',
    description: `Atomic is a decentralized wallet that supports 300+ cryptocurrency assets. Strong encryption and custody-free solution guarantee their users the highest level of security. Atomic Wallet provides instant exchange and "buy crypto with a credit card" feature.`,
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
    features: ['Buy Cryptocurrency (Visa, Master card)', 'Exchange option', 'XTZ delegation'],
    downloadLink: 'https://atomicwallet.io/downloads'
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
    description: `Galleon is a smart wallet for Tezos. Galleon is a deployment of Tezori, an open source wallet framework for Tezos, supporting both software and hardware wallets in eight languages on Mac, Windows and Linux.`,
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
    description: `One of the first Tezos wallets with offline-signing, KT backward compatibility and ledger support. Kukai is available in 6 different languages thanks to the Tezos community efforts. The wallet has been audited by one of the leading security audit German firm. Kukai guarantees full anonymity as there is no tracking, cookies or analytics in their wallet.`,
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
    title: 'paytomat',
    description: `paytomat is a non-custodial wallet that brings financial services that modern customers eager. From exchanging assets, to referral programs, to trading BEP-2 tokens or accessing dApps and games, paytomat supports over 14 cryptocurrencies and covers all of a user's wants and needs in one single app.`,
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
    features: ['reliable', 'decentralized', 'convenient'],
    downloadLink: 'https://paytomat.com/en/wallet/'
  },
  {
    title: 'simplestaking.com',
    description: `Safe way to store & stake Tezos. Desktop & Web wallet with Trezor support.`,
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
    features: ['Trezor T', 'multiple wallets', 'wallet balance history'],
    downloadLink: 'https://simplestaking.com'
  }
]

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor() {}

  get(): Observable<Wallet[]> {
    return of(wallets)
  }
}
