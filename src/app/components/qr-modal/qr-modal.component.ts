import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { CopyService } from '../../services/copy/copy.service';

@Component({
  selector: 'qr-modal',
  templateUrl: './qr-modal.component.html',

  animations: [
    trigger('changeBtnColor', [
      state(
        'copyTick',
        style({
          backgroundColor: 'lightgreen',
          backgroundImage: '',
        })
      ),
      transition('copyGrey =>copyTick', [
        animate(
          250,
          style({
            transform: 'rotateY(360deg) scale(1.3)',
            backgroundColor: 'lightgreen',
          })
        ),
      ]),
    ]),
    trigger('AnimateList', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-75%)' }),
        animate('0.3s 6ms ease-in'),
      ]),

      transition(':leave', [
        animate(
          '0.2s ease-out',
          style({ opacity: 0.01, transform: 'translateY(-75%)' })
        ),
      ]),
    ]),
  ],
})
export class QrModalComponent {
  current: string = 'copyGrey';

  @Input()
  level: string = 'L';

  @Input()
  qrdata: string | undefined;

  @Input()
  size: number = 300;

  constructor(
    public bsModalRef: BsModalRef,
    private readonly copyService: CopyService,
    private readonly toastrService: ToastrService
  ) {}

  copyToClipboard(val: string) {
    this.copyService.copyToClipboard(val);
  }

  changeState(address: string) {
    this.current = this.current === 'copyGrey' ? 'copyTick' : 'copyGrey';
    setTimeout(() => {
      this.current = 'copyGrey';
    }, 1500);
    this.toastrService.success('has been copied to clipboard', address);
  }
}
