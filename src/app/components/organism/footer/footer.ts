import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './footer.html',
    styleUrl: './footer.scss'
})
export class Footer {
    constructor(public router: Router) {}
}
