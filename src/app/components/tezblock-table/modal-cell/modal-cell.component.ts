import { Component, TemplateRef, OnInit, Input } from '@angular/core'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'

import { get } from '@tezblock/services/fp'

const tryParseJSON = (value: any) => {
  if (typeof value !== 'string') {
    return undefined
  }

  try {
    return JSON.parse(value) //(typeof json === 'object')
  } catch (error) {
    return undefined
  }
}

@Component({
  selector: 'app-modal-cell',
  templateUrl: './modal-cell.component.html',
  styleUrls: ['./modal-cell.component.scss']
})
export class ModalCellComponent implements OnInit {
  @Input()
  set data(value: string) {
    if (value !== this._data) {
      this._data = get<string>(v => v.replace('Unparsable code:', '').trim())(value)
      this.json = tryParseJSON(this._data)
    }
  }
  get data(): string {
    return this._data
  }

  json: object

  private _data: string

  modalRef: BsModalRef

  constructor(private readonly modalService: BsModalService) {}

  ngOnInit() {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }
}
