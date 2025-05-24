import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

export const authGuard = (allowedRoles: string[]): CanActivateFn => {
	return async () => {
		const authService = inject(AuthenticationService);
		const router = inject(Router);

		const token = await authService.getToken();
		const role = authService.getRole();

		if (token && allowedRoles.includes(role)) {
			return true;
		} else {
			return router.createUrlTree(['/login']);
		}
	};
};
