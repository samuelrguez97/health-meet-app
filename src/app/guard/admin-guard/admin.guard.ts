import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { UserDataService } from 'src/app/shared/services/user-data/user-data.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const response = await this.userDataService.getUserDataSnapshot(user.uid);
      return this.handleUserRedirect(response);
    }
    return false;
  }

  handleUserRedirect(response): boolean {
    const user = response;
    if (user.role === 'physio') {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}
