import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-first-organism',
    standalone: true,
    imports: [ButtonModule, RippleModule],
    templateUrl: './first-organism.html',
    styleUrl: './first-organism.scss'
})
export class FirstOrganism {}
