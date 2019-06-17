import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { Observable, Subscription } from 'rxjs'

import { MarketDataSample } from '../../services/chartdata/chartdata.service'
import { CryptoPricesService } from '../../services/crypto-prices/crypto-prices.service'

@Component({
  selector: 'pricechart-item',
  templateUrl: './pricechart-item.component.html',
  styleUrls: ['./pricechart-item.component.scss'],
  exportAs: 'base-chart'
})
export class PricechartItemComponent implements AfterViewInit, OnDestroy {
  @ViewChild('baseChart', { static: false }) public chart?: BaseChartDirective

  public date: Date
  public currentChart = 'last24h'
  public chartType: string = 'line'
  public chartLabels: string[] = []

  public chartData = {}
  public chartDatasets: { data: number[]; label: string }[] = [{ data: [], label: 'Price' }]
  public historicData$: Observable<MarketDataSample[]>
  public subscription: Subscription
  public rawData: MarketDataSample[] = []

  constructor(private readonly cryptoPricesService: CryptoPricesService) {
    this.date = new Date()
    this.chartDatasets = [{ data: [], label: 'Price' }]
    this.historicData$ = this.cryptoPricesService.historicData$

    this.subscription = this.historicData$.subscribe(data => {
      setTimeout(() => {
        // fixes ExpressionChangedAfterItHasBeenCheckedError
        if (data !== this.rawData) {
          this.rawData = data
          this.drawChart(this.currentChart, data)
        }
      }, 0)
    })
  }

  public chartOptions = {}

  public chartColors: {}[] = []

  public lineChartType: string = 'line'

  public drawChart = (interval: string, marketdata: MarketDataSample[]): void => {
    this.chartData = {}
    this.chartLabels = []
    this.chartDatasets = [{ data: [], label: 'Price' }]

    this.currentChart = interval
    let myOptions = {}
    this.rawData = marketdata
    this.chartDatasets[0].data = this.rawData.map(data => data.open)
    this.chartLabels = this.rawData.map(data => new Date(data.time * 1000).toLocaleTimeString())

    myOptions = {
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      },
      animation: {
        duration: 1250 // general animation time
      },
      hover: {
        animationDuration: 250 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      legend: {
        display: false
      },
      responsive: true,
      scaleFontColor: 'white',
      type: 'line',
      scales: {
        yAxes: [
          {
            display: false,
            gridLines: {
              display: false
            }
          }
        ],
        xAxes: [
          {
            display: false,
            gridLines: {
              display: false
            }
          }
        ]
      },
      elements: {
        point: {
          radius: 1
        },
        line: {
          tension: 0 // disables bezier curves
        }
      }
    }

    this.chartOptions = myOptions
  }
  public setLabel24h() {
    this.currentChart = 'last24h'
  }

  public ngAfterViewInit() {
    this.chartDatasets = [{ data: [], label: 'Price' }]
    this.chartLabels = []

    if (this.chart) {
      const ctx: CanvasRenderingContext2D = (this.chart.ctx as any) as CanvasRenderingContext2D

      const color1 = '2E5BFF' // rgb(122, 141, 169)

      const gradientStroke1: CanvasGradient = ctx.createLinearGradient(0, 10, 0, 0)
      gradientStroke1.addColorStop(0, `#${color1}`)

      const gradientFill1: CanvasGradient = ctx.createLinearGradient(0, 100, 0, 0)
      gradientFill1.addColorStop(0, ' rgba(46,91,255,0.00) ')
      gradientFill1.addColorStop(1, 'rgba(46,91,255,0.24)')

      this.chartColors[0] = {
        backgroundColor: gradientFill1,
        borderColor: gradientStroke1,
        pointBackgroundColor: gradientStroke1,
        pointBorderColor: gradientStroke1,
        pointHoverBackgroundColor: gradientStroke1,
        pointHoverBorderColor: gradientStroke1
      }
    }
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
