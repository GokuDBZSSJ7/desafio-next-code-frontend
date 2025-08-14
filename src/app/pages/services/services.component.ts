import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginatedResponse, Patient, Professional, ServiceItem } from '../../core/models';
import { PatientService } from '../../services/patient.service';
import { ProfessionalService } from '../../services/professional.service';
import { ServiceService } from '../../services/service.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  form!: FormGroup;

  patients: Patient[] = [];
  professionals: Professional[] = [];

  page = 1; perPage = 20; lastPage = 1;
  services: ServiceItem[] = [];
  filtered: ServiceItem[] = [];
  loading = false;
  editing: ServiceItem | null = null;

  drawerOpen = false;

  searchControl = new FormControl<string>('', { nonNullable: true });
  statusControl = new FormControl<string>('', { nonNullable: true });

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private professionalService: ProfessionalService,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      patient_id: [null as number | null, [Validators.required]],
      professional_id: [null as number | null, [Validators.required]],
      service_type: ['', [Validators.required]],
      scheduled_date: ['', [Validators.required]],
      status: ['Agendado', [Validators.required]]
    });

    this.patientService.list(1, 100).subscribe(res => this.patients = res.data || []);
    this.professionalService.list(1, 100).subscribe(res => this.professionals = res.data || []);
    this.load(1);

    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => this.applyFilter());

    this.statusControl.valueChanges
      .pipe(debounceTime(0), distinctUntilChanged())
      .subscribe(() => this.applyFilter());
  }

  load(page = 1) {
    this.loading = true; this.page = page;
    this.serviceService.list(this.page, this.perPage).subscribe({
      next: (res: PaginatedResponse<ServiceItem>) => {
        this.services = res.data || [];
        this.lastPage = res.meta?.last_page || 1;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  startCreate() {
    this.editing = null;
    this.form.reset({ status: 'Agendado' });
    this.drawerOpen = true; document.body.classList.add('no-scroll');
  }

  startEdit(item: ServiceItem) {
    const patientId      = this.coerceId((item as any).patient_id ?? item.patient?.id);
    const professionalId = this.coerceId((item as any).professional_id ?? item.professional?.id);

    this.editing = item;
    this.form.patchValue({
      patient_id:      patientId,
      professional_id: professionalId,
      service_type:    item.service_type ?? '',
      scheduled_date:  this.toLocalDatetimeInput(item.scheduled_date || ''),
      status:          item.status ?? 'Agendado'
    });

    this.drawerOpen = true; document.body.classList.add('no-scroll');
  }

  closeForm() {
    this.drawerOpen = false; document.body.classList.remove('no-scroll');
  }

  save() {
    if (this.form.invalid) return;

    const payload: ServiceItem = {
      ...this.form.value,
      patient_id: this.coerceId(this.form.value.patient_id) as any,
      professional_id: this.coerceId(this.form.value.professional_id) as any,
    };

    if (payload.scheduled_date && (payload.scheduled_date as string).length === 16) {
      payload.scheduled_date = (payload.scheduled_date as string) + ':00';
    }

    const req$ = this.editing?.id
      ? this.serviceService.update(this.editing.id, payload)
      : this.serviceService.create(payload);

    req$.subscribe(() => {
      this.closeForm();
      this.load(this.editing?.id ? this.page : 1);
      this.form.reset({ status: 'Agendado' });
      this.editing = null;
    });
  }

  remove(item: ServiceItem) {
    if (!item.id) return;
    if (!confirm('Remover agendamento?')) return;
    this.serviceService.remove(item.id).subscribe(() => this.load(this.page));
  }

  trackById = (_: number, s: ServiceItem) => s.id ?? _;

  private applyFilter() {
    const q = (this.searchControl.value || '').toLowerCase().trim();
    const st = this.statusControl.value;

    this.filtered = this.services.filter(s => {
      const hay = [
        s.patient?.name || '',
        s.professional?.name || '',
        s.professional?.specialty || '',
        s.service_type || ''
      ].join(' ').toLowerCase();

      const textOk = !q || hay.includes(q);
      const statusOk = !st || s.status === st;
      return textOk && statusOk;
    });
  }

  private toLocalDatetimeInput(value: string | Date): string {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  }

  private coerceId(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.drawerOpen) this.closeForm(); }
}
