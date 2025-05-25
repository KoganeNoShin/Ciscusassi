import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthenticationService);
	const router = inject(Router);

	const token = authService.getToken();

	const authReq = token
		? req.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
				},
			})
		: req;

	return next(authReq).pipe(
		catchError((err) => {
			if (err.status === 401 || err.status === 403) {
				console.warn('Non autorizzato, redirect al login...');
				authService.logout();
				router.navigate(['/login']);
			}
			return throwError(() => err);
		})
	);
};
