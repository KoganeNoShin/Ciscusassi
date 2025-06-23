import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthenticationService);
	const router = inject(Router);

	// Variabile che ci permette di inserire il token negli header solo
	// se stiamo facendo una richiesta verso il nostro backend, in modo
	// da prevenire errori CORS ad esempio dalle API di TOM TOM
	const isApiRequest = req.url.startsWith(environment.apiURL);
	const token = authService.getToken();

	const authReq =
		isApiRequest && token
			? req.clone({
					setHeaders: {
						Authorization: `Bearer ${token}`,
					},
				})
			: req;

	return next(authReq).pipe(
		catchError((err) => {
			const currentUrl = router.url;

			if (
				(err.status === 401 || err.status === 403) &&
				!currentUrl.includes('/login')
			) {
				console.warn('Non autorizzato, redirect al login...');
				authService.logout();
				router.navigate(['/login']);
			}
			return throwError(() => err);
		})
	);
};
