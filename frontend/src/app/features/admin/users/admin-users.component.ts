import { Component, OnInit } from '@angular/core';

import { UserAdminService } from '../../../core/services/user-admin.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['../products/admin-products.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  page = 1;
  totalPages = 1;
  search = '';
  error = '';

  constructor(private userService: UserAdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers(this.page, 10, this.search || undefined).subscribe({
      next: (res) => {
        this.users = res.data.map((u) => ({
          ...u,
          role: String(u.role).toUpperCase() as 'CLIENT' | 'ADMIN',
        }));

        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.message ?? 'Erreur lors du chargement des utilisateurs';
      },
    });
  }

  changeRole(user: User): void {
    const newRole: 'CLIENT' | 'ADMIN' =
      user.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';

    const message =
      newRole === 'ADMIN'
        ? `Transformer ${user.fullName} en ADMIN ? Il pourra se connecter à l'espace admin après reconnexion.`
        : `Transformer ${user.fullName} en CLIENT ?`;

    if (!confirm(message)) return;

    this.userService.updateRole(user.id, newRole).subscribe({
      next: () => {
        alert(
          newRole === 'ADMIN'
            ? 'Rôle changé vers ADMIN. Demandez à cet utilisateur de se déconnecter puis reconnecter.'
            : 'Rôle changé vers CLIENT.',
        );
        this.load();
      },
      error: (err) => {
        alert(err.error?.message ?? 'Erreur lors du changement de rôle');
      },
    });
  }

  deactivate(user: User): void {
    if (!confirm(`Désactiver le compte de ${user.fullName} ?`)) return;

    this.userService.deactivate(user.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        alert(err.error?.message ?? 'Erreur lors de la désactivation');
      },
    });
  }

  activate(user: User): void {
    if (!confirm(`Réactiver le compte de ${user.fullName} ?`)) return;

    this.userService.activate(user.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        alert(err.error?.message ?? 'Erreur lors de la réactivation');
      },
    });
  }

  toggleStatus(user: User): void {
    if (user.isActive) {
      this.deactivate(user);
    } else {
      this.activate(user);
    }
  }
}