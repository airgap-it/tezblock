import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { LiquidityBakingComponent } from './liquidity-baking.component';
import { initialState as appInitialState } from '@tezblock/app.reducer';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@tezblock/services/translation/translate.service.stub';
import { TranslatePipeMock } from '@tezblock/services/translation/translate.pipe.mock';
import { AddLiquidityComponent } from '@tezblock/components/add-liquidity/add-liquidity.component';
import { RemoveLiquidityComponent } from '@tezblock/components/remove-liquidity/remove-liquidity.component';
import { LiquidityInputComponent } from '@tezblock/components/liquidity-input/liquidity-input.component';
import { SwapComponent } from '@tezblock/components/swap/swap.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TabsetConfig, TabsModule } from 'ngx-bootstrap/tabs';
import { IdenticonComponent } from '@tezblock/components/identicon/identicon';
import { getPipeMock } from 'test-config/mocks/pipe.mock';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { getApiServiceMock } from '@tezblock/services/api/api.service.mock';
import { ApiService } from '@tezblock/services/api/api.service';
import { CurrencyConverterPipe } from '@tezblock/pipes/currency-converter/currency-converter.pipe';

describe('LiquidityBakingComponent', () => {
  let component: LiquidityBakingComponent;
  let fixture: ComponentFixture<LiquidityBakingComponent>;
  const initialState = { app: appInitialState };
  const pipeMock = getPipeMock();
  const apiServiceMock = getApiServiceMock();

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, TabsModule],
        declarations: [
          LiquidityBakingComponent,
          AddLiquidityComponent,
          RemoveLiquidityComponent,
          LiquidityInputComponent,
          IdenticonComponent,
          SwapComponent,
          TranslatePipe,
          IconPipe,
          CurrencyConverterPipe,
        ],
        providers: [
          TabsetConfig,
          provideMockStore({ initialState }),
          { provide: IconPipe, useValue: pipeMock },
          { provide: CurrencyConverterPipe, useValue: pipeMock },
          { provide: ApiService, useValue: apiServiceMock },
          { provide: TranslateService, useClass: TranslateServiceStub },
          { provide: TranslatePipe, useClass: TranslatePipeMock },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      });

      fixture = TestBed.createComponent(LiquidityBakingComponent);
      component = fixture.componentInstance;
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
