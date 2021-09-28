export enum EcosystemCategory {
  wallet = 'wallet',
  dapp = 'dapp',
  library = 'library',
}

export enum SocialType {
  website = 'globe',
  twitter = 'twitter',
  telegram = 'telegram',
  medium = 'medium',
  github = 'github',
}

export interface Social {
  type: SocialType;
  url: string;
}

export enum PlatformName {
  iOS = 'iOS',
  Android = 'Android',
  BrowserExtension = 'Browser Extension',
  Linux = 'Linux',
  LinuxDistribution = 'Linux Distribution',
  macOS = 'macOS',
  Windows = 'Windows',
  Web = 'Web',
}

export interface PlatformData {
  name: PlatformName;
  icon: string;
  url: string;
}

export interface EcosystemItem {
  title: string;
  description: string;
  logo: string;
  socials: Social[];
  platforms: PlatformData[];
  features: string[];
  downloadLink: string;
  category: EcosystemCategory;
}
