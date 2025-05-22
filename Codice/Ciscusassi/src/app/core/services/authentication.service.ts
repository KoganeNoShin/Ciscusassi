import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private apiURL = environment.apiURL;

	constructor() {}

	isAuthenticated() {
		return true;
	}
}
