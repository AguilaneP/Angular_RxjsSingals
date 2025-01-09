import { Component, computed, inject, Input } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { catchError, EMPTY, tap } from 'rxjs';

import { ProductService } from '../product.service';
import { CartService } from 'src/app/cart/cart.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, CurrencyPipe],
})
export class ProductDetailComponent {
  errorMessage = '';

  private productService = inject(ProductService);
  private cartService =inject(CartService)

  product = this.productService.product;

  pageTitle = computed(()=> this.product()
  ? `Product Detail for: ${this.product()?.productName}`
  : 'Product Detail')



  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
