import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { NodesOnMapComponent } from './nodes-on-map.component';
import { initialState as cnInitialState } from './reducer';

describe('NodesOnMapComponent', () => {
  let component: NodesOnMapComponent;
  let fixture: ComponentFixture<NodesOnMapComponent>;
  let storeMock: MockStore<any>;
  const initialState = { connectedNodes: cnInitialState };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [NodesOnMapComponent],
      providers: [provideMockStore({ initialState })],
    });

    fixture = TestBed.createComponent(NodesOnMapComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
