import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { EMPTY } from 'rxjs';
import { getPipeMock } from 'test-config/mocks/pipe.mock';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import { initialState as adInitialState } from '../account-detail/reducer';
import { initialState as poInitialState } from '../portfolio/reducer';

import { PortfolioComponent } from './portfolio.component';

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;
  let storeMock: MockStore<any>;
  const iconPipeMock = getPipeMock();
  const initialState = {
    accountDetails: adInitialState,
    app: appInitialState,
    portfolio: poInitialState,
  };

  function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortfolioComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: IconPipe, useValue: iconPipeMock },
        { provide: Actions, useValue: EMPTY },
      ],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
          },
        }),
      ],
    }).compileComponents();
    storeMock = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
