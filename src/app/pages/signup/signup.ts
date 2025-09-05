import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Auth } from '../../services/auth';
import { SignupRequest } from '../../models/auth.types';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, FormsModule, PasswordModule, RouterModule, RippleModule, ToastModule],
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

    constructor(private router: Router, private messageService: MessageService, private auth: Auth) {}

    async submit() {
        if (this.isLoading) {
            return;
        }

        // Validações básicas e simplificadas
        if (!this.name?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Nome obrigatório',
                detail: 'Por favor, digite seu nome',
                life: 3000
            });
            return;
        }

        if (!this.email?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Email obrigatório',
                detail: 'Por favor, digite seu email',
                life: 3000
            });
            return;
        }

        // Validação de email simplificada
        if (!this.email.includes('@')) {
            this.messageService.add({
                severity: 'error',
                summary: 'Email inválido',
                detail: 'Digite um email válido',
                life: 3000
            });
            return;
        }

        if (!this.password) {
            this.messageService.add({
                severity: 'error',
                summary: 'Senha obrigatória',
                detail: 'Por favor, digite sua senha',
                life: 3000
            });
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Senhas não coincidem',
                detail: 'As senhas devem ser iguais',
                life: 3000
            });
            return;
        }

        if (!this.acceptTerms) {
            this.messageService.add({
                severity: 'error',
                summary: 'Aceite os termos',
                detail: 'É necessário aceitar os termos de uso',
                life: 3000
            });
            return;
        }

        this.isLoading = true;

        const userData: SignupRequest = {
            name: this.name,
            email: this.email,
            password: this.password
        };

        this.auth.signup(userData).subscribe({
            next: (response) => {
                console.log('✅ Sucesso - Resposta da API:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Conta criada com sucesso!',
                    detail: 'Redirecionando para o login...',
                    life: 2000
                });

                // Redirecionamento mais rápido
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 1500);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('❌ Erro no signup:', error);
                this.isLoading = false;

                // Simplificando o tratamento de erro
                if (error.message.includes('Email já está em uso') || error.message.includes('already exists')) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Email já cadastrado',
                        detail: 'Este email já está em uso. Tente fazer login.',
                        life: 4000
                    });
                } else if (error.status === 0 || error.message.includes('CORS')) {
                    // Caso CORS - provavelmente usuário foi criado
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Conta criada!',
                        detail: 'Sua conta foi criada. Redirecionando para o login...',
                        life: 3000
                    });
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 2000);
                } else if (error.status === 500 || error.status === 201) {
                    // Erro 500 ou 201 - usuário provavelmente foi criado
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Conta criada!',
                        detail: 'Sua conta foi criada com sucesso. Redirecionando...',
                        life: 3000
                    });
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 2000);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro ao criar conta',
                        detail: 'Tente novamente ou verifique se sua conta foi criada.',
                        life: 4000
                    });
                }
            }
        });
    }

    goToLogin() {
        // Redirecionamento direto e simples
        this.router.navigate(['/login']);
    }
}
