import { Component, Input } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { CopyService } from 'src/app/services/copy/copy.service'

@Component({
  selector: 'qr',
  templateUrl: './qr-item.component.html',
  styleUrls: ['./qr-item.component.scss']
})
export class QrItemComponent {
  @Input()
  public level: string = 'L'

  @Input()
  public qrdata: string | undefined

  @Input()
  public size: number = 300

  constructor(public bsModalRef: BsModalRef, private readonly copyService: CopyService) {}

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }
}
