import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, retry, throwError, catchError } from 'rxjs';
import { UserModel } from './models/user.model';
import { UserService } from './services/user.service';
import { UserFormComponent } from './components/user-form/user-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public users: UserModel[] = [];
  displayedColumns: string[] = ['user_id', 'user_name', 'first_name', 'last_name', 'email', 'user_status', 'department', 'actions'];
  dataSource = new MatTableDataSource<UserModel>([]);
  private subscriptions = new Subscription();

  constructor(private userService: UserService, public dialog: MatDialog) { }

  ngOnInit() {
    this.getUsers();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getUsers() {
    this.subscriptions.add(
      this.userService.getUsers()
        .pipe(
          retry(3),
          catchError(error => {
            console.error('Failed to load users after retries:', error);
            return throwError(() => new Error('Failed to load users'));
          })
        )
        .subscribe({
          next: (users) => {
            this.users = users;
            this.dataSource.data = users;
          },
          error: (error) => console.error('Error fetching users:', error)
        })
    );
  }

  createUser() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '250px',
      data: {}
    });

    this.subscriptions.add(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: (user) => {
            this.users.push(user);
            this.dataSource.data = this.users;
            console.log('User created:', user);
          },
          error: (error) => {
            console.error('Failed to create user:', error);
          }
        });
      }
    }));
  }

  updateUser(user: UserModel) {
    // Ensure the user object itself is not null or undefined
    if (!user || user.id === undefined) {
      console.error('User object is null or user ID is undefined. Cannot update user.');
      return; // Exit the function if user object is invalid
    }

    // Capture the original ID to ensure it's not changed
    const originalId = user.id;

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '250px',
      data: { ...user } // Use a copy of the user object to prevent direct modifications
    });

    this.subscriptions.add(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ensure the original ID is preserved
        result.id = originalId;

        this.userService.updateUser(result).subscribe({
          next: (updatedUser) => {
            if (!updatedUser) {
              console.error('Updated user is null or undefined.');
              return; // Exit the function if updatedUser is null or undefined
            }
            // Safely attempt to find the index using the originalId
            const index = this.users.findIndex(u => u.id === originalId);
            if (index !== -1) {
              this.users[index] = updatedUser;
              this.dataSource.data = this.users;
              console.log('User updated:', updatedUser);
            } else {
              console.error('Failed to find the user in the list. User may not exist or ID mismatch.');
            }
          },
          error: (error) => {
            // Handle HTTP or service errors
            console.error('Error updating user:', error);
          }
        });
      }
    }));
  }

  deleteUser(user: UserModel) {
    if (user.id !== undefined) {
      this.subscriptions.add(this.userService.deleteUser(user.id).subscribe(() => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users.splice(index, 1);
          this.dataSource.data = this.users;
          console.log('User deleted:', user);
        }
      }));
    } else {
      console.error('User ID is undefined, cannot delete user.');
    }
  }
}
