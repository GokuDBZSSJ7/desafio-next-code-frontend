import { Injectable } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse, Professional } from '../core/models';


@Injectable({ providedIn: 'root' })
export class ProfessionalService {
    constructor(private api: ApiService) { }


    list(page = 1, per_page = 20): Observable<PaginatedResponse<Professional>> {
        return this.api.get<PaginatedResponse<Professional>>('professionals', { page, per_page });
    }


    get(id: number) { return this.api.get<Professional>(`professionals/${id}`); }
    create(data: Professional) { return this.api.post<Professional>('professionals', data); }
    update(id: number, data: Partial<Professional>) { return this.api.put<Professional>(`professionals/${id}`, data); }
    remove(id: number) { return this.api.delete<void>(`professionals/${id}`); }
}