import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IconPipe } from 'src/app/pipes/icon/icon.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ResourcesWalletItemComponent } from './resources-wallet-item.component';
import { UnitHelper } from 'test-config/unit-test-helper';
import { Wallet } from "../../interfaces/Wallet";

xdescribe('WalletComponent', () => {
  let component: ResourcesWalletItemComponent;
  let fixture: ComponentFixture<ResourcesWalletItemComponent>;
  let mockedWallet: Wallet;

  beforeEach(async(() => {
    const unitHelper = new UnitHelper();

    TestBed.configureTestingModule(
      unitHelper.testBed({
        imports: [FontAwesomeModule],
        declarations: [ResourcesWalletItemComponent],
        providers: [IconPipe]
      })
    )
      .compileComponents()
      .catch(console.error);
  }));

  beforeEach(() => {
    mockedWallet = {
      title: 'fooTitle',
      description: `fooDescription`,
      logo: 'galleon.png',
      socials: [],
      platforms: [],
      features: [],
      downloadLink: 'fooDownloadLink'
    };

    fixture = TestBed.createComponent(ResourcesWalletItemComponent);
    component = fixture.componentInstance;
    component.wallet = mockedWallet;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
