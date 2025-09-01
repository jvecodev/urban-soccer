import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Button } from '../../atoms/button/button';

@Component({
    selector: 'app-first-organism',
    standalone: true,
    imports: [ButtonModule, RippleModule, Button],
    templateUrl: './first-organism.html',
    styleUrl: './first-organism.scss'
})
export class FirstOrganism {}
