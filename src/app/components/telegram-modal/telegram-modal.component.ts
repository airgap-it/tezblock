import { Component, OnInit } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'

@Component({
  selector: 'telegram-modal',
  templateUrl: './telegram-modal.component.html'
})
export class TelegramModalComponent implements OnInit {
  form: FormGroup

  // these 2 properties initialized by modal
  botAddress: string = ''
  botName: string = ''

  get botNameInvalid() {
    return this.botNameControl.invalid && (this.botNameControl.dirty || this.botNameControl.touched) && this.botNameControl.errors.maxlength
  }

  get botNameControl() {
    return this.form.get('botName')
  }

  constructor(public bsModalRef: BsModalRef, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      botName: [this.botName, Validators.maxLength(18)]
    })
  }

  createTelegramBot() {
    if (this.form.valid) {
      const botName = this.botNameControl.value.split(' ').join('')

      if (botName) {
        window.open(`https://t.me/TezosNotifierBot?start=tezblock_${this.botAddress}_${botName}`, '_blank')
      }
    }
  }
}
