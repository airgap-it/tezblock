import { AfterViewInit, Component, Input, ViewChild } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'

@Component({
  selector: 'area-chart-item',
  templateUrl: './pricechart-item.component.html',
  styleUrls: ['./pricechart-item.component.scss'],
  exportAs: 'base-chart'
})
export class PricechartItemComponent implements AfterViewInit {
  @ViewChild('baseChart', { static: false }) chart?: BaseChartDirective

  @Input() datasets: { data: number[]; label: string }[]
  @Input() labels: string[]

  chartType: string = 'line'
  chartColors: {}[] = []

  chartOptions = {
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

  constructor() {}

  ngAfterViewInit() {
    if (this.chart) {
      const ctx: CanvasRenderingContext2D = (this.chart.ctx as any) as CanvasRenderingContext2D

      const gradientStroke1: CanvasGradient = ctx.createLinearGradient(0, 10, 0, 0)
      gradientStroke1.addColorStop(0, `#2E5BFF`) // rgb(122, 141, 169)

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
}
