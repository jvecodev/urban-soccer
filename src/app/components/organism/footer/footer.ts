import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterModule, CommonModule, FormsModule],
    templateUrl: './footer.html',
    styleUrl: './footer.scss'
})
export class Footer {
    showModal = false;
    isSubmitting = false;
    
    formData = {
        name: '',
        email: '',
        message: ''
    };

    constructor(public router: Router) {}

    async onSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        // Validação básica
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        if (!name || !email || !message) {
            return;
        }

        this.isSubmitting = true;

        try {
            // Envia o formulário para FormSubmit
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Limpa o formulário
                this.formData = { name: '', email: '', message: '' };
                form.reset();
                // Mostra o modal de sucesso
                this.showModal = true;
            } else {
                console.error('Erro ao enviar formulário');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
        } finally {
            this.isSubmitting = false;
        }
    }

    closeModal(): void {
        this.showModal = false;
    }
}
