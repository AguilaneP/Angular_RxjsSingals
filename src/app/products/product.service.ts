import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
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
import { Product, Result } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  selectedProductId = signal<number | undefined>(undefined);

  private productsResult$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((p) => ({ data: p } as Result<Product[]>)),
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    catchError((err) =>
      of({
        data: [],
        error: this.errorService.formatError(err),
      } as Result<Product[]>)
    )
  );

  private productsResult = toSignal(this.productsResult$, {
    initialValue: { data: [] } as Result<Product[]>,
  });

  products = computed(() => this.productsResult()?.data);
  productsError = computed(() => this.productsResult()?.error);

  private productResult$ = toObservable(this.selectedProductId).pipe(
    filter(Boolean),
    switchMap((id) => {
      const productUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError((err) =>
          of({
            data: undefined,
            error: this.errorService.formatError(err),
          } as Result<Product>)
        )
      );
    }),
    map((p) => ({ data: p } as Result<Product>))
  );

  private productResult = toSignal(this.productResult$, {
    initialValue: { data: undefined } as Result<Product>,
  });

  product = computed(() => this.productResult().data);
  productError = computed(() => this.productResult().error);

  productSelected(selectedProductId: number): void {
    this.selectedProductId.set(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product> {
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

//BehaviorSubject example:

// private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
// readonly productSelected$ = this.productSelectedSubject.asObservable();

// readonly product$ = this.productSelected$
//  .pipe(
//    filter(Boolean),
//    switchMap(id=>{
//      const productUrl =  this.productsUrl + '/' + id;

//      return this.http.get<Product>(productUrl)
//       .pipe(
//         switchMap(product => this.getProductWithReviews(product)),
//         catchError(err => this.handleError(err))
//       )
//    })
//  )

//combinelatest example:

// readonlyproduct$ = combineLatest([this.productSelected$, this.products$]).pipe(
//   map(([selectedProductId, products]) =>
//     products.find((product) => product.id === selectedProductId)
//   ),
//   filter(Boolean),
//   switchMap((product) => this.getProductWithReview(product)),

//   catchError((err) => this.handleError(err))
// );

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
