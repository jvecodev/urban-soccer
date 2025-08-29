import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    CardModule,
    InputTextModule,
    FloatLabel,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  email: string = '';
  password: string = '';

  onSubmit() {
    console.log('Form submitted');
  }

}
