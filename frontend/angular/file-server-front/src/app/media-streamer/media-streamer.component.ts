import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HClient } from '../util/api-util';

@Component({
  selector: 'app-media-streamer',
  templateUrl: './media-streamer.component.html',
  styleUrls: ['./media-streamer.component.css']
})
export class MediaStreamerComponent implements OnInit, OnDestroy {

  uuid: string;
  name: string;
  token: string;
  srcUrl: string;

  // refreshed every 5min
  private tokenRefresher: Subscription;

  constructor(private route: ActivatedRoute, private http: HClient) { }

  ngOnDestroy(): void {
    if (this.tokenRefresher) {
      this.tokenRefresher.unsubscribe();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.name = params.get("name");
      this.uuid = params.get("uuid");
      this.srcUrl = location.protocol + "//" + location.hostname + ":" + location.port + "/" + params.get("url");
      this.token = params.get("token");

      console.log("srcUrl", this.srcUrl);

      this.tokenRefresher = timer(60_000, 60_000).subscribe(
        () => {
          if (this.token) {
            this.http.post<void>(environment.fileServicePath, "/file/token/renew", { token: this.token })
              .subscribe({
                next: (r => console.log("Media streaming token refreshed"))
              });
          }
        }
      );

    });
  }

}
