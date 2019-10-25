import { TestBed } from "@angular/core/testing";

import { RewardsSingleService } from "./reward-single.service";

describe("RewardsSingleService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: RewardsSingleService = TestBed.get(RewardsSingleService);
    expect(service).toBeTruthy();
  });
});
