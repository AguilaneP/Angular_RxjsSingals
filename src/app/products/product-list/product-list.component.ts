import { Component, inject } from '@angular/core';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, tap } from 'rxjs';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent],
})
export class ProductListComponent {
  // Just enough here for the template to compile
  pageTitle = 'Products';

  private productService = inject(ProductService);

  products = this.productService.products;
  errorMessage = this.productService.productsError;


  selectedProductId = this.productService.selectedProductId;

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
