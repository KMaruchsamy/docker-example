import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlCardComponent } from './html-card.component';

describe('HtmlCardComponent', () => {
  let component: HtmlCardComponent;
  let fixture: ComponentFixture<HtmlCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtmlCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
