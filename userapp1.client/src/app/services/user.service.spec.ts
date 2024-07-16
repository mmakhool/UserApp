import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { UserModel } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = '/user'; // Use the expected URL directly

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all users', () => {
    const dummyUsers: UserModel[] = [
      { id: 1, user_id: '001', user_name: 'TestUser1', first_name: 'Test', last_name: 'User1', email: 'testuser1@example.com', user_status: 'active', department: 'IT' },
      { id: 2, user_id: '002', user_name: 'TestUser2', first_name: 'Test', last_name: 'User2', email: 'testuser2@example.com', user_status: 'active', department: 'HR' }
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(dummyUsers);
    });

    const request = httpMock.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush(dummyUsers);
  });

  it('should add a new user', () => {
    const newUser: UserModel = { id: 3, user_id: '003', user_name: 'TestUser3', first_name: 'Test', last_name: 'User3', email: 'testuser3@example.com', user_status: 'active', department: 'Finance' };

    service.createUser(newUser).subscribe(user => {
      expect(user).toEqual(newUser);
    });

    const request = httpMock.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    request.flush(newUser);
  });

  it('should update a user', () => {
    const updatedUser: UserModel = { id: 1, user_id: '001', user_name: 'UpdatedUser', first_name: 'Updated', last_name: 'User', email: 'updateduser@example.com', user_status: 'active', department: 'IT' };

    service.updateUser(updatedUser).subscribe(user => {
      expect(user).toEqual(updatedUser);
    });

    const request = httpMock.expectOne(`${apiUrl}/${updatedUser.id}`);
    expect(request.request.method).toBe('PUT');
    request.flush(updatedUser);
  });

  it('should delete a user', () => {
    const userId = 1;

    service.deleteUser(userId).subscribe(response => {
      expect(response).toBeNull();
    });

    const request = httpMock.expectOne(`${apiUrl}/${userId}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
