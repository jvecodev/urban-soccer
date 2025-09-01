import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './scroll-to-top.html',
    styleUrl: './scroll-to-top.scss'
})
export class ScrollToTop implements OnInit, OnDestroy {
    isVisible = false;

    ngOnInit() {
        this.checkScrollPosition();
    }

    ngOnDestroy() {
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.checkScrollPosition();
    }

    private checkScrollPosition() {
        this.isVisible = window.pageYOffset > 300;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
