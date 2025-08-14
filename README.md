# HomeCare Frontend (Angular)

Aplicação web para gestão de **Pacientes**, **Profissionais** e **Agendamentos**, consumindo a API Laravel descrita no projeto. Interface **responsiva**, com formulários em **drawer (slide-over)** para criação/edição sem poluir a listagem.

---

## 🚀 Recursos principais

- **Topbar** responsiva com menu hambúrguer e foco visível.
- **Dashboard** com KPIs (Agendados hoje, Próximos, Concluídos, Cancelados) e tabela de próximos.
- **Pacientes / Profissionais / Agendamentos**
  - Listagem com **paginação**, **busca** (reativa) e, em Agendamentos, **filtro por status**.
  - **Drawer branco** por cima do header para criar/editar (fecha por overlay/ESC).
  - Estados de **loading** (skeleton) e **empty state**.
  - Tabelas que viram **cards no mobile** (via `data-label`).

---

## 🧰 Stack

- **Angular** 17+ (componentes standalone), **TypeScript**, **RxJS**
- **SCSS** com tema claro
- **HttpClient** para consumo da API Laravel

---

## 🗂 Estrutura (resumo)

```
src/
  app/
    core/
      models/              # Tipos (Patient, Professional, ServiceItem, PaginatedResponse)
    services/              # PatientService, ProfessionalService, ServiceService
    pages/
      dashboard/
      patients/
      professionals/
      services/            # agendamentos
  assets/
  environments/
    environment.ts
    environment.prod.ts
```

---

## 🔧 Pré-requisitos

- **Node.js** 18+
- **Angular CLI** (recomendado): `npm i -g @angular/cli`
- API Laravel rodando (ex.: `http://localhost:8000`), com rotas sob `/api` e CORS liberado para o host do Angular.

---

## ⚙️ Configuração de ambiente

Defina a URL base da API nos arquivos de ambiente:

`src/environments/environment.ts`
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api'
};
```

`src/environments/environment.prod.ts`
```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://SEU-DOMINIO/api'
};
```

> Dica: mantenha um **HttpInterceptor** (opcional) para anexar a base URL/headers ou tratar erros globalmente.

---

## ▶️ Executando

Instale dependências e suba o dev server:

```bash
npm install
npm start           # ou: ng serve --open
# ng serve --port 4200
```

Build de produção:
```bash
npm run build       # ng build
```

Os artefatos saem em `dist/`.

---

## 🌐 Contrato esperado da API

**Paginação (todas as listas):**
```json
{
  "data": [ /* itens */ ],
  "meta": { "total": 123, "last_page": 7 }
}
```

**Endpoints utilizados:**
- `GET /api/patients` | `POST /api/patients` | `PUT /api/patients/{id}` | `DELETE /api/patients/{id}`
- `GET /api/professionals` | `POST /api/professionals` | `PUT /api/professionals/{id}` | `DELETE /api/professionals/{id}`
- `GET /api/services` | `POST /api/services` | `PUT /api/services/{id}` | `DELETE /api/services/{id}`

**Services (GET /api/services)** devem vir com paciente e profissional (eager loading):
```json
{
  "id": 1,
  "patient_id": 7,
  "professional_id": 3,
  "service_type": "Curativo",
  "scheduled_date": "2025-08-14T15:30:00Z",
  "status": "Agendado",
  "patient": { "id": 7, "name": "Maria..." },
  "professional": { "id": 3, "name": "Dr. João", "specialty": "..." }
}
```
> O front lida com `patient_id`/`professional_id` **ou** com `patient.id`/`professional.id`. Datas em ISO são convertidas para `YYYY-MM-DDTHH:mm` para `<input type="datetime-local">` e recebem `:ss` ao salvar.

---

## 📄 Páginas

### Dashboard
- KPIs calculados a partir da listagem de agendamentos.
- Tabela “Próximos (primeira página)”.

### Pacientes / Profissionais
- **Busca reativa** no topo (sem `FormsModule`, usando `FormControl`).
- Listagem paginada com ações à direita.
- **Drawer** para criar/editar; fecha por overlay/ESC.

### Agendamentos
- **Busca** + **filtro por Status** no topo.
- Drawer com selects de **Paciente** e **Profissional**, “Tipo de serviço”, **Data/Hora** e Status.
- Normalização de data/hora: adiciona segundos ao enviar.

---

## 🧑‍🎨 UX & Acessibilidade

- **Responsivo**: tabelas viram cards abaixo de 720px.
- **Foco visível** e uso de `[attr.aria-busy]` quando necessário.
- **Drawer**: aparece acima do header; ao abrir, `body` recebe `.no-scroll` (defina no global):
  ```css
  .no-scroll { overflow: hidden; }
  ```

---

## 🛠 Scripts úteis

```bash
npm run start     # dev
npm run build     # produção
npm run lint      # (se configurado)
```

---

## 🐞 Troubleshooting

- **“Can't bind to 'aria-busy'…”**  
  Use `[attr.aria-busy]="loading ? 'true' : null"`.

- **“Can't bind to 'ngModel'…”**  
  O projeto usa **Reactive Forms**. Se optar por `[(ngModel)]`, importe `FormsModule` no componente/módulo.

- **Editar Agendamento não seleciona Paciente/Profissional**  
  Converta IDs para `number` e considere fallback de `patient.id`/`professional.id` ao preencher o form.

---

## 📄 Licença

Livre para uso em estudos e projetos internos. Ajuste conforme sua política.
