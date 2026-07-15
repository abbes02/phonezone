# Plan d'Implémentation : Phone Shop App

## Vue d'ensemble

Implémentation d'une application full-stack Angular 17 + NestJS + PostgreSQL + Redis pour une boutique de téléphones. Le plan suit une progression incrémentale : infrastructure → backend par domaine → frontend client → frontend admin → intégration WebSocket → charte graphique. Chaque tâche de code référence les exigences correspondantes et les tests sont intercalés au plus près de l'implémentation.

---

## Tâches

- [x] 1. Initialisation du projet et infrastructure
  - [x] 1.1 Créer le monorepo NX ou les deux projets séparés (Angular `frontend/` + NestJS `backend/`)
    - Initialiser `frontend/` avec Angular CLI 17 : `ng new frontend --routing --style=scss --standalone=false`
    - Initialiser `backend/` avec NestJS CLI : `nest new backend`
    - Configurer `tsconfig.json` commun (strict: true)
    - _Exigences : 1, 13_

  - [x] 1.2 Configurer Docker Compose pour PostgreSQL et Redis
    - Créer `docker-compose.yml` avec services `postgres` (port 5432), `redis` (port 6379) et `backend`
    - Créer `.env.example` avec toutes les variables d'environnement requises (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, etc.)
    - _Exigences : 1, 13_

  - [x] 1.3 Configurer TypeORM dans NestJS (connexion PostgreSQL)
    - Installer `@nestjs/typeorm`, `typeorm`, `pg`
    - Configurer `TypeOrmModule.forRootAsync()` dans `AppModule` avec chargement depuis `.env`
    - Activer `synchronize: false` et préparer le dossier `migrations/`
    - _Exigences : 1, 4, 6, 9_

  - [x] 1.4 Configurer le module Redis dans NestJS
    - Installer `ioredis` ou `@nestjs-modules/ioredis`
    - Créer `RedisModule` injectable utilisé par `AuthService` (blacklist JWT)
    - _Exigences : 1.7, 13.2_

  - [x] 1.5 Configurer Socket.IO dans NestJS
    - Installer `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
    - Créer `EventsGateway` de base avec authentification JWT à la connexion
    - Créer les rooms `"admin"` et `"user:<id>"`
    - _Exigences : 11.2, 15_

- [x] 2. Module Authentification (backend)
  - [x] 2.1 Créer l'entité `User` et la migration TypeORM
    - Implémenter l'entité `User` avec colonnes : `id (uuid)`, `fullName`, `email (unique)`, `passwordHash`, `role (CLIENT|ADMIN)`, `isActive`, `createdAt`, `updatedAt`
    - Générer et exécuter la migration initiale
    - _Exigences : 1.1, 1.2, 5.2, 13.1_

  - [x] 2.2 Implémenter `AuthService` — inscription et hachage bcrypt
    - Installer `bcrypt`, `@types/bcrypt`
    - Implémenter `register(dto)` : validation unicité email, hachage bcrypt (coût 12), création `User`
    - Retourner un JWT signé après inscription
    - _Exigences : 1.1, 1.2, 1.3, 1.4, 13.1_

  - [x]* 2.3 Écrire le test de propriété P1 — Rejet des mots de passe trop courts
    - **Propriété 1 : Pour tout mot de passe < 8 caractères, l'inscription doit être rejetée**
    - **Valide : Exigence 1.4**
    - Utiliser `fast-check` : `fc.string({ maxLength: 7 })`

  - [x]* 2.4 Écrire le test de propriété P2 — Unicité des adresses email
    - **Propriété 2 : Pour tout email déjà enregistré, une nouvelle inscription avec cet email doit être rejetée**
    - **Valide : Exigence 1.3**
    - Utiliser `fast-check` : `fc.emailAddress()`

  - [x] 2.5 Implémenter `AuthService` — connexion et génération JWT
    - Implémenter `login(dto)` : comparaison bcrypt, génération JWT RS256 (payload : `sub`, `email`, `role`, expiry 1h)
    - Retourner message générique si identifiants invalides (ne pas préciser quel champ est incorrect)
    - _Exigences : 1.5, 1.6, 13.2_

  - [x] 2.6 Implémenter `AuthService` — déconnexion (blacklist Redis)
    - Implémenter `logout(token)` : ajouter le JWT à Redis avec TTL = durée de vie restante
    - Créer le `JwtAuthGuard` qui vérifie la blacklist Redis sur chaque requête protégée
    - _Exigences : 1.7, 13.2, 13.3_

  - [x] 2.7 Créer `AuthController` avec les endpoints REST
    - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
    - Appliquer les DTOs avec `class-validator` pour validation des payloads
    - _Exigences : 1.1–1.7_

  - [x]* 2.8 Écrire le test de propriété P11 — Isolation des rôles (backend guard)
    - **Propriété 11 : Pour tout utilisateur CLIENT, toute requête vers /admin/** doit retourner 403**
    - **Valide : Exigences 1.9, 13.4**
    - Utiliser `fast-check` : `fc.constantFrom('CLIENT')` + routes admin générées

- [x] 3. Checkpoint — Authentification backend opérationnelle
  - Vérifier que les migrations PostgreSQL s'exécutent correctement
  - S'assurer que l'inscription, la connexion et la déconnexion fonctionnent via un client REST
  - Vérifier que les tokens blacklistés sont bien rejetés
  - S'assurer que tous les tests passent. Demander à l'utilisateur si des questions se posent.

- [ ] 4. Module Produits (backend)
  - [x] 4.1 Créer l'entité `Product` et la migration
    - Implémenter `Product` : `id`, `name`, `description`, `category (PHONE|ACCESSORY|SCREEN_PROTECTOR)`, `price (decimal)`, `stockQuantity (int)`, `imageUrls (text[])`, `isActive`, `createdAt`, `updatedAt`
    - _Exigences : 2.2, 2.3, 6.1, 6.2_

  - [x] 4.2 Implémenter `ProductService` — CRUD + filtres
    - `findAll(query)` : pagination, filtre par catégorie, recherche par nom/description
    - `findOne(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`
    - Valider que `price > 0` à la création et modification
    - Bloquer la suppression si le produit est lié à une commande `PENDING | CONFIRMED | SHIPPED`
    - _Exigences : 2.2–2.7, 6.1–6.7_

  - [ ]* 4.3 Écrire le test de propriété P12 — Validation prix produit
    - **Propriété 12 : Pour tout prix ≤ 0 soumis, la création ou modification doit être rejetée**
    - **Valide : Exigence 6.3**
    - Utiliser `fast-check` : `fc.oneof(fc.constant(0), fc.float({ max: 0 }))`

  - [ ]* 4.4 Écrire le test de propriété P3 — Filtrage catalogue par catégorie
    - **Propriété 3 : Pour tout filtre de catégorie, tous les produits retournés appartiennent exclusivement à cette catégorie**
    - **Valide : Exigence 2.4**
    - Utiliser `fast-check` : `fc.constantFrom('PHONE', 'ACCESSORY', 'SCREEN_PROTECTOR')`

  - [ ]* 4.5 Écrire le test de propriété P4 — Produits hors stock désactivés
    - **Propriété 4 : Pour tout produit avec stockQuantity === 0, isAvailable doit être false**
    - **Valide : Exigence 2.7**
    - Utiliser `fast-check` : `fc.record({ stockQuantity: fc.constant(0) })`

  - [x] 4.6 Créer `ProductController` avec endpoints REST
    - `GET /api/products`, `GET /api/products/:id` (public)
    - `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` (Admin)
    - Appliquer `AdminGuard` sur les routes de modification
    - _Exigences : 6.1–6.7_

- [x] 5. Module Services de Réparation + Commandes (backend)
  - [x] 5.1 Créer les entités `RepairService`, `Order`, `OrderItem` et leurs migrations
    - `RepairService` : `id`, `name`, `description`, `indicativePrice`, `isActive`, `createdAt`, `updatedAt`
    - `Order` : `id`, `orderNumber (unique)`, `userId (FK)`, `status (PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED)`, `totalAmount`, `createdAt`, `updatedAt`
    - `OrderItem` : `id`, `orderId (FK)`, `productId (FK)`, `quantity`, `unitPrice`, `isScreenProtector`
    - _Exigences : 3.1, 4.5, 8.1_

  - [x] 5.2 Implémenter `RepairServiceManager` — CRUD services de réparation
    - `findAll()`, `create(dto)`, `update(id, dto)`, `remove(id)`
    - Bloquer la suppression si des `RepairRequest` avec statut `IN_PROGRESS` référencent ce service
    - _Exigences : 7.1–7.5_

  - [x] 5.3 Implémenter `OrderService` — création et validation de commande
    - `createOrder(userId, cartItems)` : vérifier stock disponible, créer `Order` + `OrderItems`, décrémenter stock
    - Générer `orderNumber` unique (ex: `ORD-<timestamp>-<random>`)
    - Retourner erreur si stock insuffisant (Exigence 4.7)
    - Paiement à la livraison uniquement — aucun module de paiement en ligne
    - _Exigences : 4.5, 4.7, 16.1, 16.2_

  - [x] 5.4 Implémenter `OrderService` — consultation et mise à jour statut
    - `findMine(userId)`, `findAll(query)` (Admin, paginé), `findOne(id)`, `updateStatus(id, status)`
    - _Exigences : 4.6, 8.1, 8.2_

  - [x] 5.5 Créer `RepairServiceController` et `OrderController`
    - Routes RepairService : `GET /api/repair-services` (public), CRUD Admin protégé
    - Routes Order : `POST /api/orders`, `GET /api/orders/mine` (Client), `GET /api/orders`, `PATCH /api/orders/:id/status` (Admin)
    - _Exigences : 3.1, 4.5–4.6, 7.1–7.5, 8.1–8.2_

- [x] 6. Module Réparations (backend)
  - [x] 6.1 Créer les entités `RepairRequest` et `RepairStatusHistory` et leurs migrations
    - `RepairRequest` : `id`, `referenceNumber (unique)`, `userId (FK)`, `serviceId (FK)`, `phoneModel`, `problemDescription`, `contactInfo`, `desiredDropOffSlot`, `status (PENDING|IN_PROGRESS|READY)`, `recoveryOption`, `deliveryAddress`, `finalPrice`, `discountApplied`, `createdAt`, `updatedAt`
    - `RepairStatusHistory` : `id`, `repairRequestId (FK)`, `status`, `changedAt`, `changedByAdminId (FK)`
    - _Exigences : 3.2, 3.3, 11.1, 12.1_

  - [x] 6.2 Implémenter `RepairRequestService` — soumission et consultation
    - `create(userId, dto)` : créer `RepairRequest` avec statut initial `PENDING`, générer `referenceNumber`
    - Appliquer remise fidélité 50% si bon valide disponible
    - Confirmer paiement à la livraison dans la réponse (Exigence 16.3)
    - `findMine(userId)`, `findAll(query)` (Admin, paginé), `findOne(id)` avec historique statuts
    - _Exigences : 3.2–3.5, 8.3, 10.4, 12.1, 12.5, 16.3_

  - [x] 6.3 Implémenter `RepairRequestService` — mise à jour statut (Admin)
    - `updateStatus(id, newStatus, adminId)` : valider la progression stricte (`PENDING → IN_PROGRESS → READY`)
    - Rejeter toute régression de statut avec message d'erreur explicatif
    - Enregistrer chaque changement dans `RepairStatusHistory` avec horodatage
    - _Exigences : 12.2, 12.3, 12.6_

  - [ ]* 6.4 Écrire le test de propriété P9 — Progression stricte du statut de réparation
    - **Propriété 9 : Pour tout statut courant, assigner un statut antérieur dans le flux doit être rejeté**
    - **Valide : Exigence 12.6**
    - Utiliser `fast-check` : `fc.constantFrom` sur les paires régressives `(READY→IN_PROGRESS)`, `(READY→PENDING)`, `(IN_PROGRESS→PENDING)`

  - [x] 6.5 Implémenter `RepairRequestService` — choix option récupération (Client)
    - `setRecoveryOption(id, userId, option, deliveryAddress?)` : enregistrer choix, confirmer paiement selon option
    - Pour `HOME_DELIVERY` : confirmer paiement à la remise par livreur (Exigence 16.5)
    - Pour `IN_STORE` : confirmer paiement en boutique au retrait (Exigence 16.6)
    - _Exigences : 11.4, 11.5, 16.5, 16.6_

  - [x] 6.6 Créer `RepairRequestController`
    - `POST /api/repair-requests` (Client), `GET /api/repair-requests/mine` (Client)
    - `GET /api/repair-requests` (Admin), `PATCH /api/repair-requests/:id/status` (Admin)
    - `PATCH /api/repair-requests/:id/recovery` (Client)
    - _Exigences : 3.2–3.5, 11.4–11.5, 12.1–12.6_

- [ ] 7. Module Fidélité (backend)
  - [x] 7.1 Créer les entités `LoyaltyCounter` et `LoyaltyVoucher` et leurs migrations
    - `LoyaltyCounter` : `id`, `userId (FK, unique)`, `screenProtectorCount (int, default 0)`, `repairCount (int, default 0)`, `updatedAt`
    - `LoyaltyVoucher` : `id`, `userId (FK)`, `type (SCREEN_PROTECTOR_FREE|REPAIR_DISCOUNT_50)`, `isUsed (default false)`, `generatedAt`, `usedAt`
    - Créer le `LoyaltyCounter` automatiquement à la création d'un `User`
    - _Exigences : 9.1, 10.1_

  - [x] 7.2 Implémenter `FideliteService` — compteur protège-écran
    - `incrementScreenProtector(userId, count)` : incrémenter `screenProtectorCount += count`
    - Générer un `LoyaltyVoucher` de type `SCREEN_PROTECTOR_FREE` si `screenProtectorCount % 5 === 0`
    - `decrementScreenProtector(userId, count)` : décrémenter sans passer sous 0 (annulation commande)
    - _Exigences : 9.2, 9.3, 9.6_

  - [ ]* 7.3 Écrire le test de propriété P6 — Compteur fidélité protège-écran
    - **Propriété 6 : Pour tout client avec compteur k, après m protège-écrans commandés, le nouveau compteur = k + m**
    - **Valide : Exigences 9.1, 9.2**
    - Utiliser `fast-check` : `fc.nat()` pour k et m

  - [ ]* 7.4 Écrire le test de propriété P7 — Génération de bon fidélité aux multiples de 5
    - **Propriété 7 : Pour tout compteur atteignant un multiple de 5, un bon doit être généré — ni plus tôt ni plus tard**
    - **Valide : Exigences 9.3, 10.3**
    - Utiliser `fast-check` : générer des séquences d'incréments et vérifier le nombre de bons générés

  - [ ]* 7.5 Écrire le test de propriété P8 — Cohérence du décrément fidélité
    - **Propriété 8 : Pour tout client avec compteur k, annuler m protège-écrans donne max(0, k - m)**
    - **Valide : Exigence 9.6**
    - Utiliser `fast-check` : `fc.nat()` pour k et m

  - [x] 7.6 Implémenter `FideliteService` — compteur réparations
    - `incrementRepairCount(userId)` : incrémenter `repairCount += 1`
    - Générer un `LoyaltyVoucher` de type `REPAIR_DISCOUNT_50` si `repairCount % 5 === 0`
    - _Exigences : 10.2, 10.3_

  - [ ]* 7.7 Écrire le test de propriété P14 — Incrément compteur réparations fidélité
    - **Propriété 14 : Pour tout client avec compteur r, quand une réparation passe à READY, le nouveau compteur = r + 1**
    - **Valide : Exigences 10.1, 10.2**
    - Utiliser `fast-check` : `fc.nat()` pour r

  - [x] 7.8 Implémenter `FideliteService` — consultation et application bons
    - `getLoyaltyData(userId)` : retourner `LoyaltyCounter` + bons actifs (non utilisés)
    - `applyVoucher(userId, type)` : marquer le bon comme utilisé lors d'une commande/réparation
    - _Exigences : 9.4, 9.5, 10.4, 10.5_

  - [x] 7.9 Créer `LoyaltyController`
    - `GET /api/loyalty/mine` (Client)
    - Intégrer les hooks fidélité dans `OrderService` (incrémentation protège-écrans à la commande)
    - Intégrer l'incrémentation réparations dans `RepairRequestService` (au passage en statut READY)
    - _Exigences : 9.1–9.6, 10.1–10.5_

- [x] 8. Module Questions / Diagnostic (backend)
  - [x] 8.1 Créer l'entité `Question` et la migration
    - `Question` : `id`, `questionNumber (unique)`, `userId (FK)`, `subject`, `description`, `photoUrls (text[])`, `isAnswered (default false)`, `adminResponse`, `answeredAt`, `createdAt`
    - Configurer Multer pour l'upload de photos (JPEG, PNG, WEBP, max 5 Mo)
    - _Exigences : 14.1, 14.2, 14.4_

  - [x] 8.2 Implémenter `DiagnosticService` — soumission de questions
    - `createQuestion(userId, dto, files)` : valider format et taille des fichiers, enregistrer question + chemins photos
    - Rejeter si `description` vide (Exigence 14.3)
    - Générer `questionNumber` unique
    - _Exigences : 14.1–14.5_

  - [ ]* 8.3 Écrire le test de propriété P10 — Validation des fichiers photos
    - **Propriété 10 : Pour tout fichier dont le format n'est pas JPEG/PNG/WEBP ou dont la taille dépasse 5 Mo, la soumission doit être rejetée**
    - **Valide : Exigences 14.4, 14.5**
    - Utiliser `fast-check` : générer des extensions invalides et des tailles > 5 242 880 octets

  - [x] 8.4 Implémenter `DiagnosticService` — consultation et réponse admin
    - `findMine(userId)` : historique questions du client avec réponses
    - `findAll(query)` (Admin, paginé) : liste avec `id`, `date`, `sujet`, `statut réponse`
    - `findOne(id)` : description + photos + réponse existante
    - `answerQuestion(id, adminResponse)` : enregistrer réponse, marquer `isAnswered = true`
    - _Exigences : 14.6–14.9_

  - [x] 8.5 Créer `QuestionController`
    - `POST /api/questions` (Client, multipart/form-data), `GET /api/questions/mine` (Client)
    - `GET /api/questions` (Admin), `GET /api/questions/:id` (Auth), `POST /api/questions/:id/answer` (Admin)
    - _Exigences : 14.1–14.9_

- [x] 9. Module Notifications (backend + WebSocket)
  - [x] 9.1 Créer l'entité `Notification` et la migration
    - `Notification` : `id`, `type (NEW_ORDER|NEW_REPAIR|NEW_QUESTION|RECOVERY_CHOICE)`, `message`, `relatedEntityId`, `relatedEntityType`, `isRead (default false)`, `clientName`, `createdAt`
    - _Exigences : 15.1–15.8_

  - [x] 9.2 Implémenter `NotificationService`
    - `createNotification(dto)` : créer et persister la notification en base
    - `findAll()` : liste triée par `createdAt` décroissant
    - `countUnread()` : compter les notifications avec `isRead = false`
    - `markAsRead(id)` : mettre `isRead = true`
    - Conserver toutes les notifications sans limitation (Exigence 15.8)
    - _Exigences : 15.1–15.8_

  - [ ]* 9.3 Écrire le test de propriété P13 — Cohérence du compteur de notifications non lues
    - **Propriété 13 : Pour tout ensemble de notifications, le compteur non lues = nombre de notifications où isRead === false**
    - **Valide : Exigences 15.5, 15.7**
    - Utiliser `fast-check` : `fc.array(fc.record({ isRead: fc.boolean() }))`

  - [x] 9.4 Intégrer les émissions WebSocket dans les services métier
    - Dans `OrderService.createOrder()` → émettre `notification` sur la room `"admin"` + créer `Notification`
    - Dans `RepairRequestService.create()` → émettre `notification` sur la room `"admin"` + créer `Notification`
    - Dans `DiagnosticService.createQuestion()` → émettre `notification` sur la room `"admin"` + créer `Notification`
    - Dans `RepairRequestService.setRecoveryOption()` → émettre `notification` sur la room `"admin"` + créer `Notification`
    - _Exigences : 15.1–15.4_

  - [x] 9.5 Intégrer les émissions WebSocket pour le suivi réparation client
    - Dans `RepairRequestService.updateStatus()` → émettre `repair-status-update` sur la room `"user:<userId>"`
    - Émettre `question-answered` sur la room `"user:<userId>"` depuis `DiagnosticService.answerQuestion()`
    - _Exigences : 11.2, 11.3, 14.6_

  - [x] 9.6 Créer `NotificationController`
    - `GET /api/notifications` (Admin), `GET /api/notifications/unread-count` (Admin)
    - `PATCH /api/notifications/:id/read` (Admin)
    - _Exigences : 15.5–15.8_

- [x] 10. Module Utilisateurs Admin (backend)
  - [x] 10.1 Implémenter `AdminUserService` — gestion des comptes
    - `findAll(query)` : liste paginée avec `nom`, `email`, `role`, `createdAt`
    - `search(term)` : recherche par nom ou email
    - `updateRole(id, role)` : modifier le rôle ET invalider les tokens actifs de l'utilisateur (blacklist Redis)
    - `deactivate(id, requesterId)` : marquer `isActive = false`, bloquer si `id === requesterId`
    - _Exigences : 5.2–5.6_

  - [x] 10.2 Créer `AdminUserController`
    - `GET /api/users` (Admin), `GET /api/users/:id` (Admin)
    - `PATCH /api/users/:id/role` (Admin), `PATCH /api/users/:id/deactivate` (Admin)
    - _Exigences : 5.1–5.6_

- [x] 11. Checkpoint — Backend complet opérationnel
  - Vérifier que tous les endpoints REST répondent correctement (Postman ou similar)
  - Vérifier que les WebSockets émettent bien les événements attendus
  - Vérifier que toutes les migrations sont appliquées
  - S'assurer que tous les tests passent. Demander à l'utilisateur si des questions se posent.

- [x] 12. Frontend Angular — Configuration et modules partagés
  - [x] 12.1 Configurer la charte graphique (thème SCSS bleu/jaune)
    - Créer `src/styles/_variables.scss` avec toutes les variables CSS de la palette (`$color-primary: #1A237E`, `$color-accent: #FFB300`, etc.)
    - Créer `src/styles/_typography.scss` avec import Google Fonts (`Poppins`, `Inter`, `JetBrains Mono`) et classes utilitaires
    - Créer `src/styles/_components.scss` avec les styles des boutons (primaire, secondaire, accent, danger), cartes produits, badges de statut pill-shaped, navbar
    - Intégrer `LOGO.png` dans `src/assets/` et l'utiliser dans la `NavbarComponent`
    - _Exigences : 2.1, 2.2 (aspect visuel)_

  - [x] 12.2 Créer le `CoreModule` avec guards et intercepteurs
    - Implémenter `AuthGuard` : redirige vers `/login` si non authentifié
    - Implémenter `AdminGuard` : redirige vers `/home` si rôle !== ADMIN
    - Implémenter `ClientGuard` : redirige vers `/admin/dashboard` si rôle === ADMIN
    - Implémenter `JwtInterceptor` : injecte le token Bearer dans chaque requête HTTP
    - Implémenter `ErrorInterceptor` : gestion 401 (logout + redirect login), 403 (toast erreur)
    - _Exigences : 1.8, 1.9, 13.4, 13.5_

  - [ ]* 12.3 Écrire les tests unitaires des guards Angular
    - Tester `AuthGuard` : redirige si non authentifié, laisse passer si authentifié
    - Tester `AdminGuard` : redirige CLIENT vers `/home`, laisse passer ADMIN
    - Tester `ClientGuard` : redirige ADMIN vers `/admin/dashboard`
    - _Exigences : 1.8, 1.9, 13.4, 13.5_

  - [ ]* 12.4 Écrire le test de propriété P11 — Isolation des rôles (frontend guard)
    - **Propriété 11 : Pour tout utilisateur CLIENT, l'AdminGuard doit toujours retourner false et rediriger**
    - **Valide : Exigences 1.9, 13.4**
    - Utiliser `fast-check` : `fc.record({ role: fc.constant('CLIENT') })`

  - [x] 12.5 Créer le `SharedModule` avec les composants UI réutilisables
    - `ButtonComponent` : variantes primary / secondary / accent / danger avec animation `hover:scale-105`
    - `CardComponent` : ombre douce, coins arrondis 16px, badge statut
    - `BadgeComponent` : pill-shaped, couleur selon état (vert/orange/gris)
    - `NavbarComponent` : fond `#1A237E`, logo LOGO.png, navigation, compteur panier, avatar utilisateur
    - `SpinnerComponent`, `ModalComponent`, `PaginationComponent`
    - _Exigences : 2.1, 2.2, 4.1_

  - [x] 12.6 Configurer le routing Angular avec lazy loading
    - Implémenter `app-routing.module.ts` complet (routes auth, client avec `ClientGuard`, admin avec `AdminGuard`)
    - Configurer les animations de transitions de routes (fade-slide via `@angular/animations`)
    - _Exigences : 1.8, 1.9, 13.4, 13.5_

  - [x] 12.7 Créer `AuthService` Angular et `CartService`
    - `AuthService` : `login()`, `register()`, `logout()`, `currentUser()`, `isAuthenticated()`
    - Stocker le JWT dans `localStorage`
    - `CartService` : `addItem()`, `removeItem()`, `updateQuantity()`, `getTotal()`, `clearCart()`
    - _Exigences : 1.1–1.7, 4.1–4.4_

  - [ ]* 12.8 Écrire le test de propriété P5 — Cohérence du total panier (frontend)
    - **Propriété 5 : Pour tout panier avec n articles, total = Σ(quantité × prix unitaire)**
    - **Valide : Exigence 4.2**
    - Utiliser `fast-check` : `fc.array(fc.record({ quantity: fc.nat({ max: 99 }), unitPrice: fc.float({ min: 0.01, max: 9999 }) }))`

- [x] 13. Frontend Angular — Interface Client : Auth + Catalogue + Panier
  - [x] 13.1 Créer `AuthModule` — pages Inscription et Connexion
    - `LoginPage` : formulaire email/mot de passe avec validation inline, labels flottants, lien vers inscription
    - `RegisterPage` : formulaire nom complet, email, mot de passe, confirmation mot de passe, validation temps réel
    - Intégrer `AuthService`, appliquer la charte graphique (boutons accent jaune, fond bleu profond)
    - _Exigences : 1.1–1.7_

  - [x] 13.2 Créer `HomeModule` — page d'accueil
    - Hero banner avec logo et appel à l'action
    - Cartes de catégories (Téléphones, Accessoires) et section services de réparation mis en avant
    - Animations entrée staggered des cartes
    - _Exigences : 2.1_

  - [x] 13.3 Créer `CatalogModule` — liste des produits avec filtres et recherche
    - Grille de `CardComponent` produits : nom, image, prix, badge disponibilité
    - Barre de recherche temps réel (debounce 300ms), filtre par catégorie
    - Message "Aucun résultat" si liste vide
    - Désactiver bouton "Ajouter au panier" si stock = 0
    - _Exigences : 2.2–2.7_

  - [x] 13.4 Créer `ProductDetailModule` — page détail produit
    - Images, description complète, prix, statut stock, bouton "Ajouter au panier" (désactivé si stock = 0)
    - Appeler `CartService.addItem()` au clic
    - _Exigences : 2.3, 2.7, 4.1_

  - [x] 13.5 Créer `CartModule` — panier et validation de commande
    - Liste articles avec quantité éditable, sous-total par ligne, total commande recalculé en temps réel
    - Bouton suppression article, message "Panier vide" avec lien catalogue
    - Bouton "Valider la commande" → appel `POST /api/orders`, affichage confirmation avec numéro et message paiement à la livraison
    - _Exigences : 4.1–4.7, 16.1, 16.2_

  - [x] 13.6 Créer `OrdersModule` — historique des commandes client
    - Liste des commandes avec numéro, date, montant, badge statut coloré
    - _Exigences : 4.6_

- [x] 14. Frontend Angular — Interface Client : Réparations + Fidélité + Questions
  - [x] 14.1 Créer `RepairModule` — services, formulaire demande et suivi réparation
    - Page liste services de réparation : nom, description, tarif indicatif
    - Formulaire demande de réparation : modèle téléphone, description problème, coordonnées, créneau dépôt souhaité
    - Validation champs obligatoires + message d'erreur inline
    - Message de confirmation avec numéro de référence et mention paiement à la livraison
    - Historique des demandes avec `BadgeComponent` statut (`PENDING`=gris, `IN_PROGRESS`=orange, `READY`=vert)
    - _Exigences : 3.1–3.5, 16.3_

  - [x] 14.2 Implémenter le suivi temps réel dans `RepairModule`
    - Se connecter au Socket.IO à l'initialisation du composant (authentifié)
    - Écouter l'événement `repair-status-update` → mettre à jour l'affichage sans rechargement
    - Afficher notification et formulaire choix récupération quand statut = `READY`
    - Formulaires `IN_STORE` (horaires + adresse boutique) et `HOME_DELIVERY` (confirmation/saisie adresse)
    - Confirmer mode paiement selon option choisie
    - _Exigences : 11.1–11.6, 16.5, 16.6_

  - [x] 14.3 Créer `LoyaltyModule` — programme de fidélité
    - Afficher compteur protège-écrans + progression vers prochain gratuit (ex: barre de progression 3/5)
    - Afficher compteur réparations + progression vers prochaine remise 50%
    - Liste des bons actifs non utilisés
    - Appliquer automatiquement le bon protège-écran gratuit dans le panier (prix 0€)
    - _Exigences : 9.4, 9.5, 10.5_

  - [x] 14.4 Créer `QuestionsModule` — formulaire question et historique
    - Formulaire : sujet, description (obligatoire), import photos (JPEG/PNG/WEBP, max 5 Mo)
    - Validation côté frontend : rejet immédiat des fichiers invalides avec message d'erreur
    - Confirmation avec identifiant de question unique après soumission
    - Historique des questions avec statut réponse et affichage des réponses admin
    - Écouter l'événement WebSocket `question-answered` → notification temps réel
    - _Exigences : 14.1–14.7_

- [x] 15. Frontend Angular — Interface Admin
  - [x] 15.1 Créer `DashboardModule` — tableau de bord admin
    - Stats rapides (nombre commandes, réparations, questions en attente)
    - Badge notifications non lues (abonnement WebSocket `notification` → incrément compteur)
    - _Exigences : 5.1, 15.5_

  - [x] 15.2 Créer `AdminUsersModule` — gestion des utilisateurs
    - Liste paginée : nom, email, rôle, date inscription, statut actif/inactif
    - Recherche par nom ou email
    - Actions : modifier rôle (confirmation modale), désactiver compte (confirmation modale)
    - Afficher erreur si admin tente de se désactiver lui-même
    - _Exigences : 5.2–5.6_

  - [x] 15.3 Créer `AdminProductsModule` — gestion du catalogue produits
    - Liste paginée : nom, catégorie, prix, stock, statut
    - Formulaire ajout/édition produit avec validation (prix > 0)
    - Confirmation suppression avec message d'erreur si produit lié à commande active
    - _Exigences : 6.1–6.7_

  - [x] 15.4 Créer `AdminOrdersModule` — gestion des commandes
    - Liste paginée : numéro, date, statut, montant, client
    - Mise à jour statut depuis un select (PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED)
    - _Exigences : 8.1, 8.2_

  - [x] 15.5 Créer `AdminRepairsModule` — gestion des réparations
    - Liste paginée des demandes : référence, modèle téléphone, statut, date
    - Mise à jour statut (PENDING → IN_PROGRESS → READY uniquement)
    - Détail d'une demande avec historique complet des changements de statut horodatés
    - _Exigences : 8.3, 8.4, 12.1–12.6_

  - [x] 15.6 Créer `AdminQuestionsModule` — gestion des questions / diagnostic
    - Liste paginée : identifiant, date, sujet, statut réponse
    - Détail : description, photos, réponse existante
    - Formulaire de réponse admin avec confirmation
    - _Exigences : 14.8, 14.9_

  - [x] 15.7 Créer `AdminNotificationsModule` — centre de notifications
    - Liste triée par date décroissante : type événement, nom client, date, lien vers élément
    - Marquer comme lue au clic → décrémenter compteur du tableau de bord
    - Badge de compteur non lues dans la navbar admin
    - Abonnement WebSocket `notification` → incrément temps réel du badge
    - _Exigences : 15.1–15.8_

  - [x] 15.8 Créer `AdminRepairServicesModule` — gestion des services de réparation
    - Liste des services : nom, description, tarif
    - Formulaire ajout/édition service
    - Confirmation suppression avec message d'erreur si demandes actives liées
    - _Exigences : 7.1–7.5_

- [x] 16. Checkpoint — Intégration frontend/backend complète
  - Vérifier le flux complet : inscription → connexion → ajout panier → commande → notification admin
  - Vérifier le suivi réparation en temps réel (Socket.IO client → admin et admin → client)
  - Vérifier l'application automatique des bons de fidélité
  - Vérifier l'upload et l'affichage des photos dans les questions
  - S'assurer que tous les tests passent. Demander à l'utilisateur si des questions se posent.

- [ ] 17. Tests d'intégration
  - [ ]* 17.1 Écrire le test d'intégration du flux commande complet
    - Création commande → notification admin créée → statut mis à jour par admin → statut visible côté client
    - _Exigences : 4.5, 8.1, 8.2, 15.1_

  - [ ]* 17.2 Écrire le test d'intégration du flux réparation complet
    - Soumission demande → changement statut admin → émission Socket.IO → mise à jour client → choix récupération
    - _Exigences : 3.2–3.5, 11.1–11.5, 12.1–12.5_

  - [ ]* 17.3 Écrire le test d'intégration du programme de fidélité protège-écran
    - 5 commandes avec protège-écran → bon généré → application bon sur 6ème commande (prix 0€)
    - Annulation → décrément compteur
    - _Exigences : 9.1–9.6_

  - [ ]* 17.4 Écrire le test d'intégration de l'upload photos questions
    - Fichier JPEG valide accepté, fichier PDF rejeté, fichier > 5 Mo rejeté
    - _Exigences : 14.4, 14.5_

- [x] 18. Finalisation et Polish
  - [x] 18.1 Appliquer les animations `@angular/animations` sur toutes les pages
    - Transitions de routes fade-slide
    - Animations d'entrée staggered pour les listes de produits/commandes/réparations
    - Spinner de chargement pendant les appels HTTP
    - _Exigences : 2.2 (expérience utilisateur)_

  - [x] 18.2 Vérifier la cohérence de la charte graphique sur toutes les pages
    - Valider l'utilisation du logo `LOGO.png` dans la navbar
    - Valider les badges de statut colorés (vert/orange/gris) sur commandes et réparations
    - Valider les formulaires avec labels flottants et validation inline sur toutes les pages
    - _Exigences : toutes les interfaces client et admin_

  - [x] 18.3 Vérifier l'absence complète de tout module de paiement en ligne
    - Confirmer qu'aucun formulaire de carte bancaire n'existe dans le code
    - Confirmer que tous les messages de confirmation mentionnent le paiement à la livraison
    - _Exigences : 16.1–16.6_

- [x] 19. Checkpoint final — Validation complète
  - Exécuter la suite de tests complète (Jest backend + Jest frontend) et s'assurer que tout passe
  - Vérifier que toutes les 16 exigences sont couvertes par au moins un test
  - Vérifier que les 14 propriétés de correction ont chacune un test PBT avec fast-check
  - S'assurer que tous les tests passent. Demander à l'utilisateur si des questions se posent.

---

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide (mais fortement recommandées)
- Chaque tâche référence les exigences correspondantes pour la traçabilité
- Les checkpoints (tâches 3, 11, 16, 19) permettent de valider chaque grande étape avant de continuer
- Les tests PBT (`fast-check`) valident les **propriétés universelles** ; les tests unitaires valident les **exemples spécifiques et cas limites**
- Le paiement est exclusivement à la livraison — ne jamais intégrer de module de paiement en ligne (Exigence 16.4)
- Le logo `LOGO.png` est disponible à la racine du workspace et doit être copié dans `frontend/src/assets/`
- Les 14 propriétés de correction sont taguées `Feature: phone-shop-app, Property N` pour la traçabilité
