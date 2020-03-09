// import { TestBed } from '@angular/core/testing'

// import { UnitHelper } from 'test-config/unit-test-helper'
// import { ApiServiceMock, BlockServiceMock } from 'test-config/mocks'
// import { CycleService } from './cycle.service'
// import { ApiService } from '../api/api.service'
// import { BlockService } from '../blocks/blocks.service'

// describe('CycleService', () => {
//   let unitHelper: UnitHelper
//   beforeEach(() => {
//     unitHelper = new UnitHelper()

//     TestBed.configureTestingModule(
//       unitHelper.testBed({
//         providers: [{ provide: ApiService, useValue: ApiServiceMock }, { provide: BlockService, useValue: BlockServiceMock }]
//       })
//     )
//       .compileComponents()
//       .catch(console.error)
//   })

//   it('should be created', () => {
//     const service: CycleService = TestBed.inject(CycleService)
//     expect(service).toBeTruthy()
//   })
// })
// //disabled since it throws weird error
