import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserFormComponent } from './user-form.component';
import { AppModule } from '../../app.module';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  // Mock data for testing
  const mockUserData = {
    id: 1,
    user_id: '001',
    user_name: 'TestUser',
    first_name: 'Test',
    last_name: 'User',
    email: 'testuser@example.com',
    user_status: 'active',
    department: 'IT'
  };

  // Mock MatDialogRef
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        AppModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockUserData }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with data', () => {
    expect(component.userForm.value).toEqual(mockUserData);
  });

  it('should not close dialog on save when form is invalid', () => {
    // Invalidate the form by setting an invalid email
    component.userForm.controls['email'].setValue('invalid-email'); 
    component.userForm.controls['user_name'].setValue('');

    // Call onSave method
    component.onSave();

    // Verify the dialog's close method was not called
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should not close dialog on save when form is invalid', () => {
    component.userForm.controls['email'].setValue(''); // Invalidate the form
    component.onSave();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
