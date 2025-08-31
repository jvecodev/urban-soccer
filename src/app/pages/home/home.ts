import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Header } from '../../components/organism/header/header';
import { FirstOrganism } from '../../components/organism/first-organism/first-organism';
import { Features } from '../../components/organism/new-features/new-features';
import { Footer } from '../../components/organism/footer/footer';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterModule, Header, FirstOrganism, Features, Footer, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    templateUrl: './home.html',
    styleUrl: './home.scss'
})
export class Home {}
