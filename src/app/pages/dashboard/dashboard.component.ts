import { Component } from '@angular/core';
import { ServiceItem } from '../../core/models';
import { ServiceService } from '../../services/service.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  today = new Date();
  loading = false;
  items: ServiceItem[] = []; 

  // KPIs
  scheduledToday = 0;
  upcomingCount = 0;
  completedCount = 0;
  cancelledCount = 0;

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading = true;
    this.serviceService.list(page, 50).subscribe({
      next: (res) => {
        this.items = res?.data || [];
        this.computeKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  trackByIdx = (_: number, __: unknown) => _;

  private computeKpis(): void {
    const todayYMD = this.localYMD(new Date());

    let scheduledToday = 0, upcoming = 0, done = 0, cancelled = 0;

    for (const i of this.items) {
      const status = i.status as string;
      const dateStr = i.scheduled_date as string | Date;
      const ymd = this.localYMD(dateStr);

      if (status === 'Agendado') {
        upcoming++;
        if (ymd === todayYMD) scheduledToday++;
      } else if (status === 'Concluído') {
        done++;
      } else if (status === 'Cancelado') {
        cancelled++;
      }
    }

    this.scheduledToday = scheduledToday;
    this.upcomingCount = upcoming;
    this.completedCount = done;
    this.cancelledCount = cancelled;
  }

  private localYMD(d: string | Date): string {
    const dt = typeof d === 'string' ? new Date(d) : d;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
