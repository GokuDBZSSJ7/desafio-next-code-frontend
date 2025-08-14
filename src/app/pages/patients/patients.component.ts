import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatedResponse, Patient } from '../../core/models';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss'
})
export class PatientsComponent {
  page = 1; perPage = 20; total = 0; lastPage = 1;
  items: Patient[] = [];
  loading = false;

  form!: FormGroup;
  editing: Patient | null = null;

  // UI
  drawerOpen = false;
  searchTerm = '';
  filteredItems: Patient[] = [];

  constructor(private fb: FormBuilder, private service: PatientService) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],
      address: ['', [Validators.required]],
      contact_info: ['', [Validators.required]],
      diagnosis: ['']
    });
    this.load();
  }

  load(page = 1) {
    this.loading = true; this.page = page;
    this.service.list(this.page, this.perPage).subscribe({
      next: (res: PaginatedResponse<Patient>) => {
        this.items = res.data || [];
        this.total = res.meta?.total ?? this.items.length;
        this.lastPage = res.meta?.last_page || 1;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /* Drawer controls */
  startCreate() {
    this.editing = null;
    this.form.reset();
    this.drawerOpen = true;
  }
  startEdit(item: Patient) {
    this.editing = item;
    this.form.patchValue(item);
    this.drawerOpen = true;
  }
  closeForm() { this.drawerOpen = false; }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value as Patient;

    const req$ = this.editing?.id
      ? this.service.update(this.editing.id!, payload)
      : this.service.create(payload);

    req$.subscribe(() => {
      this.closeForm();
      this.load(this.editing?.id ? this.page : 1);
      this.form.reset();
      this.editing = null;
    });
  }

  remove(item: Patient) {
    if (!item.id) return;
    if (!confirm(`Remover paciente "${item.name}"?`)) return;
    this.service.remove(item.id).subscribe(() => this.load(this.page));
  }

  /* Busca simples no cliente (pode trocar por server-side depois) */
  onSearch() { this.applyFilter(); }
  private applyFilter() {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) { this.filteredItems = this.items; return; }
    this.filteredItems = this.items.filter(p =>
      [p.name, p.contact_info, p.address]
        .some(v => (v || '').toLowerCase().includes(q))
    );
  }

  trackById = (_: number, p: Patient) => p.id ?? _;

  @HostListener('document:keydown.escape')
  onEsc() { if (this.drawerOpen) this.closeForm(); }
}
