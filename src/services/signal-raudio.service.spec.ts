import { TestBed } from '@angular/core/testing';

import { SignalRAudioService } from './signal-raudio.service';

describe('SignalRAudioService', () => {
  let service: SignalRAudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalRAudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
