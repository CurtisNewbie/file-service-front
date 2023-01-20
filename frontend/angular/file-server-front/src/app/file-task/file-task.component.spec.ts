import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTaskComponent } from './file-task.component';

describe('FileTaskComponent', () => {
  let component: FileTaskComponent;
  let fixture: ComponentFixture<FileTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
