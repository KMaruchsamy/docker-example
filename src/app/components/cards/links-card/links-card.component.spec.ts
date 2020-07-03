import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksCardComponent } from './links-card.component';

describe('LinksCardComponent', () => {
  let component: LinksCardComponent;
  let fixture: ComponentFixture<LinksCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinksCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinksCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
