import { Injectable } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse, ServiceItem } from '../core/models';


@Injectable({ providedIn: 'root' })
export class ServiceService {
    constructor(private api: ApiService) { }


    list(page = 1, per_page = 20): Observable<PaginatedResponse<ServiceItem>> {
        return this.api.get<PaginatedResponse<ServiceItem>>('services', { page, per_page });
    }


    get(id: number) { return this.api.get<ServiceItem>(`services/${id}`); }
    create(data: ServiceItem) { return this.api.post<ServiceItem>('services', data); }
    update(id: number, data: Partial<ServiceItem>) { return this.api.put<ServiceItem>(`services/${id}`, data); }
    remove(id: number) { return this.api.delete<void>(`services/${id}`); }
}