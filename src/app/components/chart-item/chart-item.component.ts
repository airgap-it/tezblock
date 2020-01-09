import { AfterViewInit, Component, Input, ViewChild } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartOptions } from 'chart.js'

export const defaultOptions: ChartOptions = {
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

@Component({
  selector: 'chart-item',
  templateUrl: './chart-item.component.html',
  styleUrls: ['./chart-item.component.scss']
})
export class ChartItemComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective

  @Input() datasets: { data: number[]; label: string }[]
  @Input() labels: string[]

  @Input()
  set options(value: ChartOptions) {
    if (value !== this._options) {
      this._options = value
    }
  }
  get options(): ChartOptions {
    return this._options || defaultOptions
  }
  private _options: ChartOptions

  @Input()
  set chartType(value: string) {
    if (value !== this._chartType) {
      this._chartType = value
    }
  }
  get chartType(): string {
    return this._chartType || 'line'
  }
  private _chartType: string

  @Input() gradientFrom = 'rgba(46,91,255,0.00)'

  chartColors: {}[] = []

  constructor() {}

  ngAfterViewInit() {
    if (this.chart) {
      const ctx: CanvasRenderingContext2D = (this.chart.ctx as any) as CanvasRenderingContext2D

      const gradientStroke1: CanvasGradient = ctx.createLinearGradient(0, 10, 0, 0)
      gradientStroke1.addColorStop(0, `#2E5BFF`) // rgb(122, 141, 169)

      const gradientFill1: CanvasGradient = ctx.createLinearGradient(0, 100, 0, 0)
      gradientFill1.addColorStop(0, this.gradientFrom)
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
