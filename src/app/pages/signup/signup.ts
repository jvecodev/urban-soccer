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
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    templateUrl: './signup.html',
    styleUrls: ['./signup.scss', '../../shared/toast-styles.scss']
})
export class Signup {
    name: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    acceptTerms: boolean = false;
    isLoading: boolean = false;

    constructor(private router: Router, private messageService: MessageService) {}

    onSignup() {
        // Prevenir múltiplas execuções
        if (this.isLoading) {
            return;
        }

        // Validar campos obrigatórios
        if (!this.name) {
            this.messageService.add({
                severity: 'error',
                summary: 'Nome obrigatório',
                detail: 'Por favor, digite seu nome para continuar',
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

        if (this.password !== this.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Senhas não coincidem',
                detail: 'Por favor, verifique se as senhas são iguais',
                life: 4000
            });
            return;
        }

        if (!this.acceptTerms) {
            this.messageService.add({
                severity: 'error',
                summary: 'Termos obrigatórios',
                detail: 'Por favor, aceite os termos de uso para continuar',
                life: 4000
            });
            return;
        }

        this.isLoading = true;

        // Simular uma chamada de API
        setTimeout(() => {
            this.isLoading = false;
            // Aqui você pode adicionar a lógica de cadastro real
            this.messageService.add({
                severity: 'success',
                summary: 'Conta criada',
                detail: 'Sua conta foi criada com sucesso! Redirecionando...',
                life: 3000
            });

            setTimeout(() => {
                this.router.navigate(['/home']);
            }, 1500);
        }, 2000);
    }

    goToLogin() {
        // Verificar se há dados preenchidos para avisar sobre a perda
        if (this.name || this.email || this.password || this.confirmPassword) {
            this.messageService.add({
                severity: 'info',
                summary: 'Navegando para login',
                detail: 'Redirecionando para a página de login...',
                life: 2000
            });

            setTimeout(() => {
                this.router.navigate(['/login']);
            }, 1000);
        } else {
            this.router.navigate(['/login']);
        }
    }
}
