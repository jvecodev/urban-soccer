import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { User, UserUpdate } from '../../models/user';
import { UserAvatar } from '../../components/atoms/user-avatar/user-avatar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    UserAvatar
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  // Signals para gerenciar estado
  currentUser = signal<User | null>(null);
  isEditModalVisible = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Form para edição
  editForm: FormGroup;

  // Computeds
  userInitial = computed(() => {
    const user = this.currentUser();
    return user?.username?.charAt(0)?.toUpperCase() || '?';
  });

  constructor(
    private router: Router,
    private authService: Auth,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.editForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData(): void {
    // Primeiro, carrega do estado atual do serviço
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    // Se não há usuário ou os dados estão incompletos, busca do servidor
    if (!user || !user.username || !user.id) {
      this.authService.getUserProfile().subscribe({
        next: (profile) => {
          const updatedUser = user ? { ...user, id: profile._id, username: profile.name, email: profile.email } : {
            id: profile._id,
            username: profile.name,
            email: profile.email,
            token: this.authService.getToken()
          };
          this.currentUser.set(updatedUser);
        },
        error: (error) => {
          console.error('Erro ao carregar perfil:', error);
          // Se falhar e não há usuário, redireciona para login
          if (!user) {
            this.router.navigate(['/login']);
          }
        }
      });
    } else {
      // Mesmo com dados, tenta atualizar em background
      this.authService.getUserProfile().subscribe({
        next: (profile) => {
          const updatedUser = { ...user, id: profile._id, username: profile.name, email: profile.email };
          this.currentUser.set(updatedUser);
        },
        error: (error) => {
          console.warn('Não foi possível atualizar dados do usuário:', error);
          // Mantém os dados atuais se falhar
        }
      });
    }
  }

  onEditProfile(): void {
    const user = this.currentUser();
    if (user) {
      this.editForm.patchValue({
        username: user.username,
        email: user.email,
        password: ''
      });
      this.isEditModalVisible.set(true);
    }
  }

  onSaveProfile(): void {
    if (this.editForm.valid) {
      const user = this.currentUser();
      if (!user) return;

      this.isLoading.set(true);

      const updateData: UserUpdate = {};
      const formValue = this.editForm.value;

      // Só inclui campos que foram modificados
      if (formValue.username !== user.username) {
        updateData.name = formValue.username;  // Mapeia username para name
      }
      if (formValue.email !== user.email) {
        updateData.email = formValue.email;
      }
      if (formValue.password && formValue.password.trim()) {
        updateData.password = formValue.password;
      }

      // Se não há mudanças, fecha o modal
      if (Object.keys(updateData).length === 0) {
        this.isEditModalVisible.set(false);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'info',
          summary: 'Nenhuma alteração',
          detail: 'Não foram detectadas mudanças para salvar.'
        });
        return;
      }

      this.authService.updateUserProfile(user.id, updateData).subscribe({
        next: (updatedProfile) => {
          this.currentUser.set({
            ...user,
            id: updatedProfile._id,
            username: updatedProfile.name,
            email: updatedProfile.email
          });
          this.isEditModalVisible.set(false);
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Perfil Atualizado',
            detail: 'Suas informações foram atualizadas com sucesso!'
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao Atualizar',
            detail: error.message || 'Ocorreu um erro ao atualizar o perfil.'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onDeleteAccount(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão da Conta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Deletar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const user = this.currentUser();
        if (user) {
          this.isLoading.set(true);
          this.authService.deleteUserAccount(user.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Conta Deletada',
                detail: 'Sua conta foi deletada com sucesso.'
              });
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 2000);
            },
            error: (error) => {
              this.isLoading.set(false);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro ao Deletar',
                detail: error.message || 'Ocorreu um erro ao deletar a conta.'
              });
            }
          });
        }
      }
    });
  }

  onLegend(): void {
    this.router.navigate(['/player-selection']);
  }

  onHome(): void{
    this.router.navigate(['/home']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onCancelEdit(): void {
    this.isEditModalVisible.set(false);
    this.editForm.reset();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para facilitar validação no template
  get usernameErrors() {
    const control = this.editForm.get('username');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Nome de usuário é obrigatório';
      if (control.errors['minlength']) return 'Nome deve ter pelo menos 3 caracteres';
    }
    return null;
  }

  get emailErrors() {
    const control = this.editForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Email é obrigatório';
      if (control.errors['email']) return 'Email deve ter um formato válido';
    }
    return null;
  }

  get passwordErrors() {
    const control = this.editForm.get('password');
    if (control?.touched && control?.errors && control?.value) {
      if (control.errors['minlength']) return 'Senha deve ter pelo menos 6 caracteres';
    }
    return null;
  }
}
