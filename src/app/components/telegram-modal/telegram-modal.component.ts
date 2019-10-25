import { Component } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'

@Component({
  selector: 'telegram-modal',
  templateUrl: './telegram-modal.component.html'
})
export class TelegramModalComponent {
  public text: string = ''
  public botName: string = ''
  public botAddress: string = ''

  constructor(public bsModalRef: BsModalRef) {}

  public createTelegramBot() {
    const botName = this.botName.split(' ').join('')
    if (botName) {
      window.open(`https://t.me/TezosNotifierBot?start=${this.botAddress}_${botName}`, '_blank')
    }
  }
}
