import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavController } from '@ionic/angular';

export const authGuard: CanActivateFn = async (route, state) => {
	const authService = inject(AuthenticationService);
	const navigation = inject(NavController);

	if (await authService.isAuthenticated()) {
    	return true;
  	}

	navigation.navigateRoot('/login');
	return false;

};
