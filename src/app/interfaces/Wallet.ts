export enum SocialType {
  website = 'globe',
  twitter = 'twitter',
  telegram = 'telegram',
  medium = 'medium',
  github = 'github'
}

export interface Social {
  type: SocialType
  url: string
}

export enum PlatformName {
  iOS = 'iOS',
  Android = 'Android',
  BrowserExtension = 'BrowserExtension',
  Linux = 'Linux',
  LinuxDistribution = 'LinuxDistribution',
  macOS = 'macOS',
  Windows = 'Windows'
}

export interface PlatformData {
  name: PlatformName
  icon: string
  url: string
}

export interface Wallet {
  title: string
  description: string
  logo: string
  socials: Social[]
  platforms: PlatformData[]
  features: string[]
  downloadLink: string
}
