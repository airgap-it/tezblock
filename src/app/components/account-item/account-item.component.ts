import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from '@tezblock/domain/account';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account-item',
  templateUrl: './account-item.component.html',
  styleUrls: ['./account-item.component.scss'],
})
export class AccountItemComponent {
  constructor(private readonly router: Router) {}
  @Input()
  public data: Observable<Account> | undefined;

  public inspectDetail(level: string) {
    this.router.navigate([`/account/${level}`]);
  }
}
