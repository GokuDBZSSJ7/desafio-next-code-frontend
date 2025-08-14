import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginatedResponse, Professional } from '../../core/models';
import { ProfessionalService } from '../../services/professional.service';

@Component({
  selector: 'app-professionals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './professionals.component.html',
  styleUrls: ['./professionals.component.scss'] // <-- corrige styleUrl
})
export class ProfessionalsComponent implements OnInit {
  page = 1; perPage = 20; total = 0; lastPage = 1;
  items: Professional[] = [];
  filteredItems: Professional[] = [];
  loading = false;

  form!: FormGroup;
  editing: Professional | null = null;

  drawerOpen = false;

  // busca reativa (sem FormsModule)
  searchControl = new FormControl<string>('', { nonNullable: true });
  private searchTerm = '';

  constructor(private fb: FormBuilder, private service: ProfessionalService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      contact_info: ['', [Validators.required]]
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((v) => { this.searchTerm = v ?? ''; this.applyFilter(); });

    this.load();
  }

  load(page = 1) {
    this.loading = true; this.page = page;
    this.service.list(this.page, this.perPage).subscribe({
      next: (res: PaginatedResponse<Professional>) => {
        this.items = res.data || [];
        this.total = res.meta?.total || this.items.length;
        this.lastPage = res.meta?.last_page || 1;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /* Drawer controls */
  startCreate() {
    this.editing = null; this.form.reset();
    this.drawerOpen = true; document.body.classList.add('no-scroll');
  }
  startEdit(item: Professional) {
    this.editing = item; this.form.patchValue(item);
    this.drawerOpen = true; document.body.classList.add('no-scroll');
  }
  closeForm() {
    this.drawerOpen = false; document.body.classList.remove('no-scroll');
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value as Professional;
    const req$ = this.editing?.id
      ? this.service.update(this.editing.id, payload)
      : this.service.create(payload);

    req$.subscribe(() => {
      this.closeForm();
      this.load(this.editing?.id ? this.page : 1);
      this.form.reset();
      this.editing = null;
    });
  }

  remove(item: Professional) {
    if (!item.id) return;
    if (!confirm(`Remover profissional "${item.name}"?`)) return;
    this.service.remove(item.id).subscribe(() => this.load(this.page));
  }

  private applyFilter() {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) { this.filteredItems = this.items; return; }
    this.filteredItems = this.items.filter(p =>
      [p.name, p.specialty, p.contact_info].some(v => (v || '').toLowerCase().includes(q))
    );
  }

  trackById = (_: number, p: Professional) => p.id ?? _;

  @HostListener('document:keydown.escape')
  onEsc() { if (this.drawerOpen) this.closeForm(); }
}
