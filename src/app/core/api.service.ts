import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiService {
private readonly base = environment.apiUrl.replace(/\/$/, '');
constructor(private http: HttpClient) {}


get<T>(path: string, params?: Record<string, any>) {
let httpParams = new HttpParams();
if (params) Object.keys(params).forEach(k => {
if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
httpParams = httpParams.set(k, String(params[k]));
}
});
return this.http.get<T>(`${this.base}/${path.replace(/^\//,'')}`, { params: httpParams });
}


post<T>(path: string, body: any) {
return this.http.post<T>(`${this.base}/${path.replace(/^\//,'')}`, body);
}


put<T>(path: string, body: any) {
return this.http.put<T>(`${this.base}/${path.replace(/^\//,'')}`, body);
}


delete<T>(path: string) {
return this.http.delete<T>(`${this.base}/${path.replace(/^\//,'')}`);
}
}