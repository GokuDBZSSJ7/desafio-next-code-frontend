import { Injectable } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse, Patient } from '../core/models';


@Injectable({ providedIn: 'root' })
export class PatientService {
    constructor(private api: ApiService) { }


    list(page = 1, per_page = 20): Observable<PaginatedResponse<Patient>> {
        return this.api.get<PaginatedResponse<Patient>>('patients', { page, per_page });
    }


    get(id: number) { return this.api.get<Patient>(`patients/${id}`); }
    create(data: Patient) { return this.api.post<Patient>('patients', data); }
    update(id: number, data: Partial<Patient>) { return this.api.put<Patient>(`patients/${id}`, data); }
    remove(id: number) { return this.api.delete<void>(`patients/${id}`); }
}