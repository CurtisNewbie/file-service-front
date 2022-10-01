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
import { Resp } from "src/models/resp";

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
          // console.log("Http error response: ", e);

          if (e.status === 401) {
            this.notifi.toast("Please login first");
            this.userService.logout();
          } else if (e.status === 403) {
            let r: Resp<any> = e.error as Resp<any>;
            this.notifi.toast(r.msg, 6000);
          } else {
            this.notifi.toast("Unknown server error, please try again later");
          }
          return throwError(e);
        }
      })
    );
  }

}
