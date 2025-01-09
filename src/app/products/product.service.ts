import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { Product } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { UntypedFormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(
    undefined
  );

  readonly productSelected$ = this.productSelectedSubject.asObservable();

  readonly products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    catchError((err) => this.handleError(err))
  );

  // readonly product2$ = this.productSelected$.pipe(
  //   filter(Boolean),
  //   switchMap((id) => {
  //     const productUrl = this.productsUrl + '/' + id;
  //     return this.http.get<Product>(productUrl).pipe(
  //       switchMap((product) => this.getProductWithReview(product)),
  //       shareReplay(1),
  //       catchError((err) => this.handleError(err))
  //     );
  //   })
  // );

  product$ = combineLatest([this.productSelected$, this.products$]).pipe(
    map(([selectedProductId, products]) =>
      products.find((product) => product.id === selectedProductId)
    ),
    filter(Boolean),
    switchMap((product) => this.getProductWithReview(product)),

    catchError((err) => this.handleError(err))
  );
  productSelected(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private getProductWithReview(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(map((reviews) => ({ ...product, reviews } as Product)));
    } else return of(product);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage);
  }
}

// getProducts(): Observable<Product[]> {
//   return this.http.get<Product[]>(this.productsUrl).pipe(
//     tap(() => console.log('In http.get pipeline')),
//     catchError((err) => this.handleError(err))
//   );
// }

// getProduct(id: number): Observable<Product> {
//   const productUrl = this.productsUrl + '/' + id;
//   return this.http.get<Product>(productUrl).pipe(
//     tap(() => console.log('In http.get by idpipeline')),
//     switchMap((product) => this.getProductWithReview(product)),
//     catchError((err) => this.handleError(err))
//   );
// }
