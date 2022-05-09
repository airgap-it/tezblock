import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TabbedTableComponent } from './tabbed-table.component';
import { getActivatedRouteMock } from 'test-config/mocks/activated-route.mock';
import { DownloadService } from '@tezblock/services/download/download.service';
import { getDownloadServiceMock } from '@tezblock/services/download/download.service.mock';
import { Tab } from '@tezblock/domain/tab';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('TabbedTableComponent', () => {
  let component: TabbedTableComponent;
  let fixture: ComponentFixture<TabbedTableComponent>;
  const activatedRouteMock = getActivatedRouteMock();
  const downloadServiceMock = getDownloadServiceMock();
  let storeMock: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DownloadService, useValue: downloadServiceMock },
        provideMockStore(),
      ],
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [TabbedTableComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(TabbedTableComponent);
    component = fixture.componentInstance;
    storeMock = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tabs', () => {
    let firstTab, secondTab: Tab;

    beforeEach(() => {
      firstTab = {
        title: 'first',
        active: false,
        count: 10,
        kind: '1',
        disabled: () => false,
      };
      secondTab = {
        title: 'foo',
        active: false,
        count: 10,
        kind: '2',
        disabled: () => false,
      };
    });

    it('when query has tab info which has data and is enabled then selects this tab', () => {
      activatedRouteMock.snapshot.queryParamMap.get.and.returnValue('foo');
      component.tabs = [firstTab, secondTab];

      expect(component.selectedTab).toBe(secondTab);
    });

    it('when query has tab info which has NO data then selects first tab', () => {
      activatedRouteMock.snapshot.queryParamMap.get.and.returnValue('foo');
      component.tabs = [firstTab, { ...secondTab, count: 0 }];

      expect(component.selectedTab).toBe(firstTab);
    });

    it('when no valid tabs then selects one with truthy flag active', () => {
      const _secondTab = { ...secondTab, count: 0, active: true };
      component.tabs = [{ ...firstTab, count: 0 }, _secondTab];

      expect(component.selectedTab).toBe(_secondTab);
    });
  });
});
