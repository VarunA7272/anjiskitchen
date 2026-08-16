import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule, AdminShellComponent],
  template: `
    <app-admin-shell>
      <div class="admin-cats">
        <div class="page-header">
          <div>
            <h1>Categories</h1>
            <p class="page-sub">{{ categories().length }} categories</p>
          </div>
          <button class="btn btn-primary btn-sm" (click)="openForm()" id="add-cat-btn">+ Add Category</button>
        </div>

        <div class="cats-grid">
          @for (cat of categories(); track cat.id) {
            <div class="cat-card">
              <div class="cat-card-info">
                <strong>{{ cat.name }}</strong>
                <span class="cat-slug">{{ cat.slug }}</span>
                @if (cat.description) { <p class="cat-desc">{{ cat.description }}</p> }
              </div>
              <div class="cat-card-meta">
                <span class="status-dot" [class.active]="cat.is_active">{{ cat.is_active ? 'Active' : 'Hidden' }}</span>
                <div class="action-btns">
                  <button class="table-btn edit" (click)="editCat(cat)" [id]="'edit-cat-' + cat.id">Edit</button>
                  <button class="table-btn delete" (click)="deleteCat(cat.id)" [id]="'del-cat-' + cat.id">Delete</button>
                </div>
              </div>
            </div>
          }
        </div>

        @if (showForm()) {
          <div class="modal-bg" (click)="closeForm()"></div>
          <div class="cat-form-modal">
            <div class="modal-header">
              <h2>{{ editingCat() ? 'Edit Category' : 'Add Category' }}</h2>
              <button (click)="closeForm()" class="close-btn">✕</button>
            </div>
            <form class="cat-form" (ngSubmit)="saveCat()">
              <div class="form-group">
                <label class="form-label">Category Name *</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.name" name="name" required (ngModelChange)="autoSlug()" placeholder="e.g. Baked Goods" />
              </div>
              <div class="form-group">
                <label class="form-label">Slug</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.slug" name="slug" placeholder="auto-generated" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.description" name="description" placeholder="Optional description"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Display Order</label>
                <input class="form-input dark-input" type="number" [(ngModel)]="form.display_order" name="display_order" min="0" />
              </div>
              <div class="form-checkboxes">
                <label class="check-label"><input type="checkbox" [(ngModel)]="form.is_active" name="is_active" /><span>Active</span></label>
              </div>
              @if (formError()) { <div class="form-error">{{ formError() }}</div> }
              <div class="form-actions">
                <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-cat-btn" [disabled]="saving()">{{ saving() ? 'Saving...' : (editingCat() ? 'Update' : 'Add Category') }}</button>
              </div>
            </form>
          </div>
        }
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-cats { padding: 2rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; color: #fff; }
    .page-sub { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-top: 0.25rem; }
    .cats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .cat-card { background: rgba(40,22,32,0.7); border: 1px solid rgba(232,105,154,0.12); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; transition: all var(--transition-base); }
    .cat-card:hover { border-color: rgba(232,105,154,0.25); }
    .cat-card-info strong { display: block; color: rgba(255,255,255,0.9); font-size: 0.9875rem; font-weight: 700; margin-bottom: 0.25rem; }
    .cat-slug { font-size: 0.75rem; color: rgba(255,255,255,0.35); display: block; }
    .cat-desc { font-size: 0.8125rem; color: rgba(255,255,255,0.45); margin-top: 0.375rem; line-height: 1.5; }
    .cat-card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.625rem; }
    .status-dot { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.625rem; border-radius: var(--radius-full); background: rgba(229,62,62,0.1); color: rgba(229,62,62,0.8); }
    .status-dot.active { background: rgba(72,187,120,0.1); color: #68d391; }
    .action-btns { display: flex; gap: 0.375rem; }
    .table-btn { padding: 0.3rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all var(--transition-fast); border: 1px solid; background: none; }
    .table-btn.edit { border-color: rgba(232,105,154,0.3); color: var(--rose-light); }
    .table-btn.edit:hover { background: rgba(232,105,154,0.12); }
    .table-btn.delete { border-color: rgba(229,62,62,0.3); color: rgba(229,62,62,0.8); }
    .table-btn.delete:hover { background: rgba(229,62,62,0.1); }
    .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100; }
    .cat-form-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: min(480px,96vw); background: #221418; border: 1px solid rgba(232,105,154,0.2); border-radius: var(--radius-xl); z-index: 101; box-shadow: 0 40px 120px rgba(0,0,0,0.5); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .modal-header h2 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; }
    .close-btn { color: rgba(255,255,255,0.4); font-size: 1.125rem; cursor: pointer; background: none; border: none; }
    .close-btn:hover { color: var(--rose-light); }
    .cat-form { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
    .dark-input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
    .dark-input::placeholder { color: rgba(255,255,255,0.25); }
    .dark-input:focus { border-color: var(--rose); background: rgba(255,255,255,0.08); box-shadow: 0 0 0 3px rgba(232,105,154,0.12); }
    .form-checkboxes { display: flex; gap: 1.5rem; }
    .check-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .check-label input { accent-color: var(--rose); width: 16px; height: 16px; }
    .form-error { padding: 0.75rem; background: rgba(229,62,62,0.12); border: 1px solid rgba(229,62,62,0.25); border-radius: var(--radius-sm); color: #fc8181; font-size: 0.875rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  saving = signal(false);
  editingCat = signal<Category | null>(null);
  formError = signal('');
  form = { name: '', slug: '', description: '', display_order: 0, is_active: true };

  async ngOnInit() { await this.loadCategories(); }

  private async loadCategories() { this.categories.set(await this.supabase.getAllCategories()); }

  openForm() { this.editingCat.set(null); this.form = { name: '', slug: '', description: '', display_order: this.categories().length, is_active: true }; this.showForm.set(true); }

  editCat(cat: Category) { this.editingCat.set(cat); this.form = { name: cat.name, slug: cat.slug, description: cat.description ?? '', display_order: cat.display_order, is_active: cat.is_active }; this.showForm.set(true); }

  closeForm() { this.showForm.set(false); this.formError.set(''); }

  autoSlug() { this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  async saveCat() {
    if (!this.form.name) { this.formError.set('Category name is required.'); return; }
    this.saving.set(true); this.formError.set('');
    try {
      const data = { name: this.form.name, slug: this.form.slug || this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: this.form.description, display_order: this.form.display_order, is_active: this.form.is_active };
      const editing = this.editingCat();
      if (editing) { await this.supabase.updateCategory(editing.id, data); } else { await this.supabase.createCategory(data); }
      await this.loadCategories();
      this.closeForm();
    } catch (e: any) { this.formError.set(e?.message || 'Failed to save category.'); } finally { this.saving.set(false); }
  }

  async deleteCat(id: string) { if (!confirm('Delete this category?')) return; await this.supabase.deleteCategory(id); await this.loadCategories(); }
}
