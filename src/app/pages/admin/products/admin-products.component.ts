import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminShellComponent } from '../admin-shell.component';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [FormsModule, AdminShellComponent],
  template: `
    <app-admin-shell>
      <div class="admin-products">
        <div class="page-header">
          <div>
            <h1>Products</h1>
            <p class="page-sub">{{ products().length }} total products</p>
          </div>
          <button class="btn btn-primary btn-sm" (click)="openForm()" id="add-product-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Add Product
          </button>
        </div>

        <div class="admin-table-wrap">
          @if (loading()) {
            <div class="loading-state">Loading products...</div>
          } @else if (products().length === 0) {
            <div class="empty-state-admin">
              <p>No products yet. Add your first product!</p>
              <button class="btn btn-primary btn-sm" (click)="openForm()">Add Product</button>
            </div>
          } @else {
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <td><div class="product-thumb"><img [src]="product.images[0] || 'assets/placeholder.jpg'" [alt]="product.name" /></div></td>
                    <td><strong class="product-name-cell">{{ product.name }}</strong><span class="product-slug">{{ product.slug }}</span></td>
                    <td><span class="cat-chip">{{ product.category?.name || '—' }}</span></td>
                    <td class="price-cell">₹{{ product.price }}</td>
                    <td><button class="status-toggle" (click)="toggleActive(product)" [class.active]="product.is_active">{{ product.is_active ? 'Active' : 'Hidden' }}</button></td>
                    <td><button class="featured-toggle" (click)="toggleFeatured(product)" [class.on]="product.is_featured">{{ product.is_featured ? '⭐' : '☆' }}</button></td>
                    <td>
                      <div class="action-btns">
                        <button class="table-btn edit" (click)="editProduct(product)" [id]="'edit-product-' + product.id">Edit</button>
                        <button class="table-btn delete" (click)="deleteProduct(product.id)" [id]="'del-product-' + product.id">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        @if (showForm()) {
          <div class="modal-bg" (click)="closeForm()"></div>
          <div class="product-form-modal">
            <div class="modal-header">
              <h2>{{ editingProduct() ? 'Edit Product' : 'Add New Product' }}</h2>
              <button (click)="closeForm()" class="close-btn">✕</button>
            </div>
            <form class="product-form" (ngSubmit)="saveProduct()">
              <div class="form-2col">
                <div class="form-group">
                  <label class="form-label">Product Name *</label>
                  <input class="form-input dark-input" type="text" [(ngModel)]="form.name" name="name" required (ngModelChange)="autoSlug()" />
                </div>
                <div class="form-group">
                  <label class="form-label">Slug</label>
                  <input class="form-input dark-input" type="text" [(ngModel)]="form.slug" name="slug" />
                </div>
              </div>
              <div class="form-2col">
                <div class="form-group">
                  <label class="form-label">Price (₹) *</label>
                  <input class="form-input dark-input" type="number" [(ngModel)]="form.price" name="price" required min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label">Original Price (₹)</label>
                  <input class="form-input dark-input" type="number" [(ngModel)]="form.original_price" name="original_price" min="0" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select class="form-select dark-input" [(ngModel)]="form.category_id" name="category_id" required>
                  <option value="">Select category</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea class="form-textarea dark-input" [(ngModel)]="form.description" name="description" required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Sizes / Variants (comma-separated)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.sizesStr" name="sizes" placeholder="e.g. 250g, 500g, 1kg" />
              </div>
              <div class="form-group">
                <label class="form-label">Tags (comma-separated)</label>
                <input class="form-input dark-input" type="text" [(ngModel)]="form.tagsStr" name="tags" placeholder="e.g. bestseller, homemade" />
              </div>
              <div class="form-group">
                <label class="form-label">Product Images</label>
                <div class="image-upload-zone">
                  <input type="file" id="product-images" accept="image/*" multiple (change)="onFilesSelected($event)" style="display:none" />
                  <label for="product-images" class="upload-label">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
                    <span>Click to upload images</span><small>PNG, JPG up to 5MB each</small>
                  </label>
                </div>
                @if (previewUrls().length > 0) {
                  <div class="image-previews">
                    @for (url of previewUrls(); track $index) {
                      <div class="preview-item">
                        <img [src]="url" alt="Preview" />
                        <button type="button" class="remove-img" (click)="removeImage($index)">✕</button>
                      </div>
                    }
                  </div>
                }
                @if (uploadProgress() > 0 && uploadProgress() < 100) {
                  <div class="upload-progress"><div class="progress-bar" [style.width]="uploadProgress() + '%'"></div></div>
                }
              </div>
              <div class="form-checkboxes">
                <label class="check-label"><input type="checkbox" [(ngModel)]="form.is_active" name="is_active" /><span>Active</span></label>
                <label class="check-label"><input type="checkbox" [(ngModel)]="form.is_featured" name="is_featured" /><span>Featured on Homepage</span></label>
              </div>
              @if (formError()) { <div class="form-error">{{ formError() }}</div> }
              <div class="form-actions">
                <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-product-btn" [disabled]="saving()">
                  {{ saving() ? 'Saving...' : (editingProduct() ? 'Update' : 'Save Product') }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </app-admin-shell>
  `,
  styles: [`
    .admin-products { padding: 2rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .page-header h1 { font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; color: #fff; }
    .page-sub { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-top: 0.25rem; }
    .admin-table-wrap { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.07); }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table thead tr { background: rgba(40,22,32,0.8); }
    .admin-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.8125rem; font-weight: 600; color: rgba(255,255,255,0.45); letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
    .admin-table td { padding: 0.875rem 1rem; border-top: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
    .admin-table tr:hover td { background: rgba(255,255,255,0.02); }
    .product-thumb { width: 48px; height: 48px; border-radius: var(--radius-sm); overflow: hidden; }
    .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .product-name-cell { display: block; color: rgba(255,255,255,0.9); font-size: 0.9rem; font-weight: 600; }
    .product-slug { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
    .cat-chip { background: rgba(232,105,154,0.12); color: var(--rose-light); padding: 0.2rem 0.625rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
    .price-cell { color: var(--rose-light); font-weight: 700; font-family: var(--font-heading); }
    .status-toggle { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); border: 1px solid rgba(229,62,62,0.3); background: rgba(229,62,62,0.08); color: rgba(229,62,62,0.8); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all var(--transition-fast); }
    .status-toggle.active { background: rgba(72,187,120,0.12); border-color: rgba(72,187,120,0.3); color: #68d391; }
    .featured-toggle { background: none; border: none; color: rgba(255,255,255,0.35); font-size: 1.125rem; cursor: pointer; transition: color var(--transition-fast); }
    .featured-toggle.on { color: var(--gold-light); }
    .action-btns { display: flex; gap: 0.375rem; }
    .table-btn { padding: 0.3rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all var(--transition-fast); border: 1px solid; background: none; }
    .table-btn.edit { border-color: rgba(232,105,154,0.3); color: var(--rose-light); }
    .table-btn.edit:hover { background: rgba(232,105,154,0.12); }
    .table-btn.delete { border-color: rgba(229,62,62,0.3); color: rgba(229,62,62,0.8); }
    .table-btn.delete:hover { background: rgba(229,62,62,0.1); }
    .loading-state, .empty-state-admin { padding: 3rem; text-align: center; color: rgba(255,255,255,0.4); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100; }
    .product-form-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: min(680px,96vw); max-height: 90vh; overflow-y: auto; background: #221418; border: 1px solid rgba(232,105,154,0.2); border-radius: var(--radius-xl); z-index: 101; box-shadow: 0 40px 120px rgba(0,0,0,0.5); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.07); position: sticky; top: 0; background: #221418; z-index: 10; }
    .modal-header h2 { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff; }
    .close-btn { color: rgba(255,255,255,0.4); font-size: 1.125rem; cursor: pointer; padding: 0.25rem 0.5rem; transition: color var(--transition-fast); background: none; border: none; }
    .close-btn:hover { color: var(--rose-light); }
    .product-form { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .dark-input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
    .dark-input::placeholder { color: rgba(255,255,255,0.25); }
    .dark-input:focus { border-color: var(--rose); background: rgba(255,255,255,0.08); box-shadow: 0 0 0 3px rgba(232,105,154,0.12); }
    .image-upload-zone { border: 2px dashed rgba(232,105,154,0.3); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; transition: border-color var(--transition-fast); }
    .image-upload-zone:hover { border-color: var(--rose); }
    .upload-label { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; color: rgba(255,255,255,0.4); }
    .upload-label span { font-size: 0.9375rem; color: rgba(255,255,255,0.6); }
    .upload-label small { font-size: 0.75rem; }
    .image-previews { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .preview-item { position: relative; width: 80px; height: 80px; border-radius: var(--radius-sm); overflow: hidden; }
    .preview-item img { width: 100%; height: 100%; object-fit: cover; }
    .remove-img { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; background: rgba(229,62,62,0.8); color: #fff; font-size: 0.625rem; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; }
    .upload-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 0.5rem; overflow: hidden; }
    .progress-bar { height: 100%; background: var(--gradient-rose); border-radius: 2px; transition: width 0.3s; }
    .form-checkboxes { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .check-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .check-label input { accent-color: var(--rose); width: 16px; height: 16px; }
    .form-error { padding: 0.75rem; background: rgba(229,62,62,0.12); border: 1px solid rgba(229,62,62,0.25); border-radius: var(--radius-sm); color: #fc8181; font-size: 0.875rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
  `]
})
export class AdminProductsComponent implements OnInit {
  private supabase = inject(SupabaseService);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingProduct = signal<Product | null>(null);
  formError = signal('');
  previewUrls = signal<string[]>([]);
  uploadProgress = signal(0);
  selectedFiles: File[] = [];
  form = { name: '', slug: '', price: 0, original_price: 0, category_id: '', description: '', sizesStr: '', tagsStr: '', is_active: true, is_featured: false };

  async ngOnInit() { await Promise.all([this.loadProducts(), this.loadCategories()]); }

  private async loadProducts() {
    try { this.loading.set(true); this.products.set(await this.supabase.getAllProducts()); } finally { this.loading.set(false); }
  }

  private async loadCategories() { this.categories.set(await this.supabase.getAllCategories()); }

  openForm() { this.editingProduct.set(null); this.resetForm(); this.showForm.set(true); }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.form = { name: product.name, slug: product.slug, price: product.price, original_price: product.original_price ?? 0, category_id: product.category_id, description: product.description, sizesStr: (product.sizes ?? []).join(', '), tagsStr: (product.tags ?? []).join(', '), is_active: product.is_active, is_featured: product.is_featured };
    this.previewUrls.set([...product.images]);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.formError.set(''); this.selectedFiles = []; this.previewUrls.set([]); }

  resetForm() { this.form = { name: '', slug: '', price: 0, original_price: 0, category_id: '', description: '', sizesStr: '', tagsStr: '', is_active: true, is_featured: false }; this.previewUrls.set([]); this.selectedFiles = []; }

  autoSlug() { this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedFiles = Array.from(input.files);
    const blobUrls = this.selectedFiles.map(f => URL.createObjectURL(f));
    this.previewUrls.set([...this.previewUrls().filter(u => !u.startsWith('blob:')), ...blobUrls]);
  }

  removeImage(index: number) { const u = [...this.previewUrls()]; u.splice(index, 1); this.previewUrls.set(u); }

  async saveProduct() {
    if (!this.form.name || !this.form.price || !this.form.category_id || !this.form.description) { this.formError.set('Please fill all required fields.'); return; }
    this.saving.set(true); this.formError.set('');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.uploadProgress.set(Math.round((i / this.selectedFiles.length) * 100));
        uploadedUrls.push(await this.supabase.uploadImage(this.selectedFiles[i]));
      }
      this.uploadProgress.set(100);
      const existingImages = this.previewUrls().filter(u => !u.startsWith('blob:'));
      const productData: Partial<Product> = { name: this.form.name, slug: this.form.slug || this.form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), price: this.form.price, original_price: this.form.original_price || undefined, category_id: this.form.category_id, description: this.form.description, images: [...existingImages, ...uploadedUrls], sizes: this.form.sizesStr ? this.form.sizesStr.split(',').map(s => s.trim()).filter(Boolean) : [], tags: this.form.tagsStr ? this.form.tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [], is_active: this.form.is_active, is_featured: this.form.is_featured };
      const editing = this.editingProduct();
      if (editing) { await this.supabase.updateProduct(editing.id, productData); } else { await this.supabase.createProduct(productData); }
      await this.loadProducts();
      this.closeForm();
    } catch (e: any) { this.formError.set(e?.message || 'Failed to save product.'); } finally { this.saving.set(false); this.uploadProgress.set(0); }
  }

  async toggleActive(product: Product) { await this.supabase.updateProduct(product.id, { is_active: !product.is_active }); await this.loadProducts(); }
  async toggleFeatured(product: Product) { await this.supabase.updateProduct(product.id, { is_featured: !product.is_featured }); await this.loadProducts(); }
  async deleteProduct(id: string) { if (!confirm('Delete this product?')) return; await this.supabase.deleteProduct(id); await this.loadProducts(); }
}
