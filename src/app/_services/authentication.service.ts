import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthObject } from './../_models/auth';

@Injectable()
export class AuthenticationService {
    public token: string;
    public authObject: AuthObject = {};
    public headers: HttpHeaders;
    public readonly apiUrl = environment.apiUrl;
    public readonly baseUrl = environment.baseUrl;

    constructor(public http: HttpClient) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('user'));
        this.token = currentUser && currentUser.token;
    }

    isLoggedIn() {
        if (localStorage.getItem('user')) {
           return true;
       }
       return false;
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(this.apiUrl+'/auth/login', { username: email, password: password })

        //return this.http.post('https://azapp-tektrak-mobileappservices-poc.azurewebsites.net/.auth/login/google?response_type=token&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2Fo2c.html&realm=na&client_id=na&state=authClient&session_mode=token&post_login_redirect_url=http%3A%2F%2F127.0.0.1%3A5500%2Fo2c.html')
            .pipe(
                map((response: Response) => {
                    // login successful if there's a jwt token in the response
                    this.token = response['token'];
                    let expiresIn = response['expires_in'];
                    if (this.token) {
                        // store expiresIn and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem('user',
                            JSON.stringify({ expires_in: expiresIn, token: this.token }));
                    }
                    return response;
                })
            );
    }

    loginViaGoogle(access_token: string, state: string) {
        this.token = access_token;

        if (this.token) {
            // store expiresIn and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user',
                JSON.stringify({ // expires_in: expiresIn,
                    token: this.token
                }));
        }

        console.log(this.token);
    }

    updateAuthObject(newAuthObject: AuthObject) {
        this.authObject = newAuthObject;
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(this.apiUrl+'/auth/signup', { email: email, name: username, password: password })
            .pipe(
                map((response: Response) => {
                    // register successful if there's a jwt token in the response
                    this.token = response['token'];
                    let expiresIn = response['expires_in'];
                    if (this.token) {
                        // store expiresIn and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem('user', 
                            JSON.stringify({ expires_in: expiresIn, token: this.token }));
                    }
                    return response;
                })
            );
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('user');
    }

    sendPasswordResetEmail(email: string): Observable<any>  {
        return this.http.post(this.apiUrl+'/auth/recovery', { email: email})
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    resetPassword(newPassword: string, confirmedPassword: string, token: string): Observable<any> {
        return this.http.post(this.apiUrl+'/auth/reset', { password: newPassword, password_confirmation: confirmedPassword, token: token })
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

}