import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UserService } from './services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UserModel } from './models/user.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let userServiceMock: any;
  let dialogMock: any;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['getUsers', 'createUser', 'updateUser', 'deleteUser']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    userServiceMock.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, MatDialogModule, MatTableModule, MatIconModule],
      declarations: [AppComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have users loaded on init', fakeAsync(() => {
    const expectedUsers: UserModel[] = [
      { id: 1, user_id: 'user1', user_name: 'user_name1', first_name: 'FirstName1', last_name: 'LastName1', email: 'user1@example.com', user_status: 'Active', department: 'Department1' },
      { id: 2, user_id: 'user2', user_name: 'user_name2', first_name: 'FirstName2', last_name: 'LastName2', email: 'user2@example.com', user_status: 'Active', department: 'Department2' },
      { id: 3, user_id: 'user3', user_name: 'user_name3', first_name: 'FirstName3', last_name: 'LastName3', email: 'user3@example.com', user_status: 'Active', department: 'Department3' }
    ];

    userServiceMock.getUsers.and.returnValue(of(expectedUsers));

    fixture.detectChanges(); // ngOnInit() will be called here
    tick(); // Simulate the passage of time until all asynchronous activities finish

    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBeGreaterThan(0);
    expect(component.users).toEqual(expectedUsers);
    expect(component.dataSource.data).toEqual(expectedUsers);
  }));

  it('should add a new user', fakeAsync(() => {
    const newUser: UserModel = {
      user_id: 'user4',
      user_name: 'user_name4',
      first_name: 'FirstName4',
      last_name: 'LastName4',
      email: 'user4@example.com',
      user_status: 'Active',
      department: 'Department4'
    };

    // Setup mock return values
    userServiceMock.createUser.and.returnValue(of(newUser));
    dialogMock.open.and.returnValue({ afterClosed: () => of(newUser) });

    // Assume initialUsers are already loaded in the component
    const initialLength = component.users.length;

    // Trigger the method to add a new user
    component.createUser();
    tick(); // Wait for all asynchronous operations to complete

    // Assertions
    expect(component.users.length).toBe(initialLength + 1); // Verify the users array length has increased by 1
    expect(component.users.some(user => user.email === newUser.email && user.user_id === newUser.user_id)).toBeTrue(); // Verify the new user is in the users array
    expect(component.dataSource.data.some(user => user.email === newUser.email && user.user_id === newUser.user_id)).toBeTrue(); // Verify the new user is in the dataSource
  }));

  it('should update a user', fakeAsync(() => {
    // Initialize with a user that matches the one we're updating
    const initialUsers: UserModel[] = [
      { id: 1, user_id: 'user1', user_name: 'user_name1', first_name: 'FirstName1', last_name: 'LastName1', email: 'user1@example.com', user_status: 'Active', department: 'Department1' }
    ];
    userServiceMock.getUsers.and.returnValue(of(initialUsers));
    fixture.detectChanges(); // Load initial users
    tick();

    const updatedUser: UserModel = { id: 1, user_id: 'user1', user_name: 'updated_user_name1', first_name: 'UpdatedFirstName1', last_name: 'UpdatedLastName1', email: 'updated_user1@example.com', user_status: 'Active', department: 'Department1' };
    userServiceMock.updateUser.and.returnValue(of(updatedUser));
    dialogMock.open.and.returnValue({ afterClosed: () => of(updatedUser) }); // Simulate user updating an existing user

    // Call updateUser method
    component.updateUser(updatedUser);
    tick(); // Complete pending asynchronous operations

    fixture.detectChanges(); // Simulate change detection

    // Verify the user has been updated in the component's users array and dataSource
    expect(component.users.find(u => u.id === updatedUser.id)).toEqual(updatedUser);
    expect(component.dataSource.data.find(u => u.id === updatedUser.id)).toEqual(updatedUser);
  }));

  it('should delete a user', () => {
    const userToDelete: UserModel = { id: 1, user_id: 'user1', user_name: 'user_name1', first_name: 'FirstName1', last_name: 'LastName1', email: 'user1@example.com', user_status: 'Active', department: 'Department1' };
    userServiceMock.deleteUser.and.returnValue(of({})); // Simulate successful deletion


    component.deleteUser(userToDelete);

    fixture.detectChanges(); // Simulate change detection

    expect(component.users.length).toBeLessThan(3);
    expect(component.users).not.toContain(userToDelete);
    expect(component.dataSource.data).not.toContain(userToDelete);
  });
});
