import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Header } from "./components/organism/header/header";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule,
    Header
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'urban-soccer';
}
