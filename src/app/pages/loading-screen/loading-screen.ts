import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  templateUrl: './loading-screen.html',
  styleUrls: ['./loading-screen.scss'],

})
export class LoadingScreenComponent implements OnInit, OnDestroy {
  private loadingTimer?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadingTimer = window.setTimeout(() => {
      this.navigateToLogin();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  }

  private navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
