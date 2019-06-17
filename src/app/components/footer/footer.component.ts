import { Component } from '@angular/core'
import { IconService, IconRef } from 'src/app/services/icon/icon.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(private readonly iconService: IconService) {}

  public icon(name: IconRef): string[] {
    return this.iconService.iconProperties(name)
  }
}
