import { Component, TemplateRef, OnInit, Input } from '@angular/core'
import { BsModalService, BsModalRef } from 'ngx-bootstrap'

@Component({
  selector: 'app-modal-cell',
  templateUrl: './modal-cell.component.html',
  styleUrls: ['./modal-cell.component.scss']
})
export class ModalCellComponent implements OnInit {

  @Input() data: string;
  
  modalRef: BsModalRef;

  constructor(private readonly modalService: BsModalService) {}

  ngOnInit() {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }
}
