export interface Node {
  country: string
  countryCode: string
  city: string
  lat: number
  lon: number
  org: string
  bootstrap: boolean
  neighbours: number
}

export interface Heatmap {
  country: string
  countryCode: string
  count: number
}

export interface TopCountry {
  country: string
  count: number
}

export interface TopCity {
  city: string
  count: number
}

export interface TopHosting {
  hosting: string
  count: number
}

export interface TzKTServicesStats {
  heatmap: Heatmap[]
  topCountries: TopCountry[]
  topCities: TopCity[]
  topHosting: TopHosting[]
}

