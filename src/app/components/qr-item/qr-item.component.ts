import { Component, Input } from '@angular/core'
import { CopyService } from 'src/app/services/copy/copy.service'

@Component({
  selector: 'qr',
  templateUrl: './qr-item.component.html',
  styleUrls: ['./qr-item.component.scss']
})
export class QrItemComponent {
  @Input()
  level: string = 'L'

  @Input()
  qrdata: string | undefined

  @Input()
  size: number = 300

  constructor(private readonly copyService: CopyService) {}

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }
}
