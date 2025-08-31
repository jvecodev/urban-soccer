import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  templateUrl: './loading-screen.html',
  styleUrls: ['./loading-screen.scss']
})
export class LoadingScreen implements OnInit, OnDestroy {
  private loadingTimer?: number;
  isExiting = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadingTimer = window.setTimeout(() => {
      this.startExitAnimation();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  }

  private startExitAnimation(): void {
    this.isExiting = true;
    setTimeout(() => {
      this.navigateToHome();
    }, 1500);
  }

  private navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
