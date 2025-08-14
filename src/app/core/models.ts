export interface Patient {
id?: number;
name: string;
birth_date: string;
address: string;
contact_info: string;
diagnosis?: string | null;
created_at?: string;
updated_at?: string;
}


export interface Professional {
id?: number;
name: string;
specialty: string;
contact_info: string;
created_at?: string;
updated_at?: string;
}


export interface ServiceItem {
id?: number;
patient_id: number;
professional_id: number;
service_type: string;
scheduled_date: string;
status: 'Agendado' | 'Concluído' | 'Cancelado';
patient?: Patient;
professional?: Professional;
created_at?: string;
updated_at?: string;
}


export interface PaginatedResponse<T> {
data: T[];
meta?: {
current_page: number;
last_page: number;
total: number;
per_page?: number;
};
links?: any;
}