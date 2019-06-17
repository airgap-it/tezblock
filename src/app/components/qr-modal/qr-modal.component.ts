import { Component, Input } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'

import { CopyService } from '../../services/copy/copy.service'
import { trigger, state, style, animate, transition, group } from '@angular/animations'
import { ToastrService } from 'ngx-toastr'
import { IconService, IconRef } from 'src/app/services/icon/icon.service'

@Component({
  selector: 'qr-modal',
  templateUrl: './qr-modal.component.html',

  animations: [
    trigger('changeBtnColor', [
      state(
        'copyTick',
        style({
          backgroundColor: 'lightgreen',
          backgroundImage: ''
        })
      ),
      transition('copyGrey =>copyTick', [animate(250, style({ transform: 'rotateY(360deg) scale(1.3)', backgroundColor: 'lightgreen' }))])
    ]),
    trigger('AnimateList', [
      transition(':enter', [style({ opacity: 0, transform: 'translateY(-75%)' }), animate('0.3s 6ms ease-in')]),

      transition(':leave', [animate('0.2s ease-out', style({ opacity: 0.01, transform: 'translateY(-75%)' }))])
    ])
  ]
})
export class QrModalComponent {
  public current: string = 'copyGrey'

  @Input()
  public level: string = 'L'

  @Input()
  public qrdata: string | undefined

  @Input()
  public size: number = 300

  constructor(public bsModalRef: BsModalRef, private readonly copyService: CopyService, private readonly toastrService: ToastrService, private readonly iconService: IconService) {}

  public copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val)
  }

  public changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey'
    setTimeout(() => {
      this.current = 'copyGrey'
    }, 1500)
    this.toastrService.success('has been copied to clipboard', address)
  }

  public icon(name: IconRef): string[] {
    return this.iconService.iconProperties(name)
  }
}
