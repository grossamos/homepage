import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatisticalProgressiveOverloadComponent } from './project-statistical-progressive-overload.component';

describe('ProjectStatisticalProgressiveOverloadComponent', () => {
  let component: ProjectStatisticalProgressiveOverloadComponent;
  let fixture: ComponentFixture<ProjectStatisticalProgressiveOverloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectStatisticalProgressiveOverloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStatisticalProgressiveOverloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
