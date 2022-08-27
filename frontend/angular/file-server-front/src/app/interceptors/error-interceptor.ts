import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { UserService } from "../user.service";
import { NotificationService } from "../notification.service";

/**
 * Intercept http error response
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private userService: UserService,
    private notifi: NotificationService
  ) { }

  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(httpRequest).pipe(
      catchError((e) => {
        if (e instanceof HttpErrorResponse) {
          console.log("Http error response status:", e.status);

          if (e.status === 401 || e.status === 403) {
            this.notifi.toast("Please login first");
            console.log("intercepted error: status:", e)
            this.userService.logout();
          } else {
            this.notifi.toast("Unknown server error, please try again later");
          }
          return throwError(e);
        }
      })
    );
  }

}
