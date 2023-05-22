import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingItemComponent } from './mapping-item.component';

describe('MappingItemComponent', () => {
  let component: MappingItemComponent;
  let fixture: ComponentFixture<MappingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
