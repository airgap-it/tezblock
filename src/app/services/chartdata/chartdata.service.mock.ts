export const getChartDataServiceMock = () =>
  jasmine.createSpyObj('ChartDataService', {
    fetchHourlyMarketPrices: Promise.resolve(undefined)
  })
