import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    templateUrl: './login.html',
    styleUrls: ['./login.scss', '../../shared/toast-styles.scss']
})
export class Login {
    email: string = '';
    password: string = '';
    checked: boolean = false;
    isLoading: boolean = false;

    constructor(private router: Router, private messageService: MessageService) {}

    onLogin() {
        // Prevenir múltiplas execuções
        if (this.isLoading) {
            return;
        }

        // Validar campos obrigatórios - mostrar apenas um toast por vez
        if (!this.email && !this.password) {
            this.messageService.add({
                severity: 'error',
                summary: 'Campos obrigatórios',
                detail: 'Por favor, preencha seu email e senha para continuar',
                life: 4000
            });
            return;
        }

        if (!this.email) {
            this.messageService.add({
                severity: 'error',
                summary: 'Email obrigatório',
                detail: 'Por favor, digite seu email para continuar',
                life: 4000
            });
            return;
        }

        if (!this.password) {
            this.messageService.add({
                severity: 'error',
                summary: 'Senha obrigatória',
                detail: 'Por favor, digite sua senha para continuar',
                life: 4000
            });
            return;
        }

        this.isLoading = true;

        // Simular uma chamada de API
        setTimeout(() => {
            this.isLoading = false;
            // Aqui você pode adicionar a lógica de autenticação real
            this.messageService.add({
                severity: 'success',
                summary: 'Login realizado',
                detail: 'Bem-vindo de volta! Redirecionando...',
                life: 3000
            });

            setTimeout(() => {
                this.router.navigate(['/home']);
            }, 1500);
        }, 2000);
    }

    goToSignup() {
        // Verificar se há dados preenchidos para avisar sobre a perda
        if (this.email || this.password) {
            this.messageService.add({
                severity: 'info',
                summary: 'Navegando para cadastro',
                detail: 'Redirecionando para a página de cadastro...',
                life: 2000
            });

            setTimeout(() => {
                this.router.navigate(['/signup']);
            }, 1000);
        } else {
            this.router.navigate(['/signup']);
        }
    }
}
