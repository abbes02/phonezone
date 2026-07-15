# Document de Exigences

## Introduction

Cette fonctionnalité consiste à développer une application web Angular complète pour une boutique proposant des services de réparation de téléphones, ainsi que la vente d'accessoires et de téléphones. L'application s'appuie sur une base de données et expose deux interfaces distinctes : une interface **Client** permettant de parcourir et commander des produits/services, et une interface **Administrateur** permettant de gérer les utilisateurs et le catalogue de produits.

## Glossaire

- **Application** : L'application web Angular développée pour la boutique.
- **Client** : Utilisateur enregistré qui navigue, commande des produits ou des services de réparation.
- **Admin** : Utilisateur disposant de droits d'administration pour gérer le contenu et les utilisateurs.
- **Produit** : Article mis en vente (téléphone ou accessoire), composé d'un nom, d'une description, d'un prix et d'un stock.
- **Service** : Prestation de réparation proposée par la boutique (ex. : remplacement d'écran, batterie, etc.).
- **Commande** : Ensemble de produits sélectionnés par un Client et soumis à l'Application.
- **Demande_Reparation** : Formulaire soumis par un Client pour demander un service de réparation.
- **Panier** : Sélection temporaire de produits associée à la session d'un Client.
- **Catalogue** : Ensemble des produits et services disponibles dans l'Application.
- **Authentification_Service** : Module gérant l'identification et l'autorisation des utilisateurs.
- **Produit_Service** : Module gérant les opérations CRUD sur les produits du Catalogue.
- **Commande_Service** : Module gérant la création et le suivi des Commandes.
- **Admin_Service** : Module gérant les opérations d'administration (utilisateurs, produits).
- **Fidelite_Service** : Module gérant le suivi des programmes de fidélité (compteurs d'achats et de réparations) pour chaque Client.
- **Reparation_Service** : Module gérant le cycle de vie des Demandes_Reparation, y compris la mise à jour des statuts et les options de récupération.
- **Protege_Ecran** : Accessoire de type anti-casse proposé à la vente dans le Catalogue.
- **Statut_Reparation** : État courant d'une Demande_Reparation parmi les valeurs définies : "En attente", "Maintenance en cours", "Téléphone prêt".
- **Option_Recuperation** : Choix proposé au Client lorsque l'état d'une Demande_Reparation est "Téléphone prêt" : récupération en boutique ou livraison à domicile.
- **Question** : Formulaire soumis par un Client pour poser une question ou décrire un problème relatif à son téléphone, accompagné de photos optionnelles.
- **Diagnostic_Service** : Module gérant la réception, le stockage et le traitement des Questions soumises par les Clients ainsi que les réponses de l'Admin.
- **Notification** : Message d'alerte affiché dans l'interface Admin signalant une nouvelle action effectuée par un Client sur la plateforme.
- **Notification_Service** : Module gérant la création, le stockage et l'affichage des Notifications destinées à l'Admin.
- **Paiement_A_La_Livraison** : Mode de paiement unique de l'Application : le règlement s'effectue au moment de la livraison ou du retrait en boutique, sans paiement en ligne.

---

## Exigences

### Exigence 1 : Inscription et Authentification

**User Story :** En tant qu'utilisateur, je veux pouvoir créer un compte et me connecter, afin d'accéder aux fonctionnalités de l'Application en fonction de mon rôle.

#### Critères d'Acceptation

1. THE Application SHALL proposer un formulaire d'inscription contenant les champs : nom complet, adresse email, mot de passe et confirmation de mot de passe.
2. WHEN un utilisateur soumet un formulaire d'inscription valide, THE Authentification_Service SHALL créer un compte Client et retourner un jeton d'authentification.
3. IF l'adresse email soumise lors de l'inscription est déjà utilisée, THEN THE Authentification_Service SHALL retourner un message d'erreur indiquant que l'email est déjà associé à un compte existant.
4. IF le mot de passe soumis lors de l'inscription contient moins de 8 caractères, THEN THE Authentification_Service SHALL retourner un message d'erreur indiquant les règles de complexité requises.
5. WHEN un utilisateur soumet des identifiants de connexion valides, THE Authentification_Service SHALL retourner un jeton d'authentification signé contenant le rôle de l'utilisateur.
6. IF un utilisateur soumet des identifiants de connexion incorrects, THEN THE Authentification_Service SHALL retourner un message d'erreur générique sans préciser quel champ est incorrect.
7. WHEN un utilisateur se déconnecte, THE Authentification_Service SHALL invalider le jeton d'authentification actif et rediriger l'utilisateur vers la page d'accueil.
8. WHILE un utilisateur est connecté avec le rôle Admin, THE Application SHALL rediriger toute tentative d'accès à l'interface Client vers l'interface Admin.
9. WHILE un utilisateur est connecté avec le rôle Client, THE Application SHALL interdire l'accès à toutes les routes de l'interface Admin.

---

### Exigence 2 : Navigation et Catalogue Produits (Interface Client)

**User Story :** En tant que Client, je veux parcourir le catalogue de produits (téléphones et accessoires), afin de trouver et consulter les articles disponibles.

#### Critères d'Acceptation

1. THE Application SHALL afficher une page d'accueil présentant les catégories de produits disponibles (téléphones, accessoires) et les services de réparation.
2. WHEN un Client accède à la page catalogue, THE Application SHALL afficher la liste des produits disponibles avec leur nom, image, prix et statut de stock.
3. WHEN un Client sélectionne un produit, THE Application SHALL afficher une page de détail présentant la description complète, les images, le prix et la disponibilité du produit.
4. WHEN un Client applique un filtre par catégorie, THE Application SHALL mettre à jour l'affichage pour ne montrer que les produits correspondant à la catégorie sélectionnée.
5. WHEN un Client saisit un terme dans la barre de recherche, THE Application SHALL afficher les produits dont le nom ou la description contiennent le terme saisi.
6. IF aucun produit ne correspond aux critères de recherche ou de filtre, THEN THE Application SHALL afficher un message indiquant qu'aucun résultat n'a été trouvé.
7. WHILE le stock d'un produit est égal à zéro, THE Application SHALL afficher le produit comme indisponible et désactiver le bouton d'ajout au panier.

---

### Exigence 3 : Services de Réparation (Interface Client)

**User Story :** En tant que Client, je veux consulter les services de réparation disponibles et soumettre une demande, afin de faire réparer mon téléphone.

#### Critères d'Acceptation

1. THE Application SHALL afficher une page dédiée aux services de réparation listant chaque service avec son nom, sa description et son tarif indicatif.
2. WHEN un Client sélectionne un service de réparation, THE Application SHALL afficher un formulaire de demande de réparation contenant les champs : modèle de téléphone, description du problème, coordonnées de contact et créneau de dépôt souhaité.
3. WHEN un Client soumet un formulaire de Demande_Reparation valide, THE Commande_Service SHALL enregistrer la demande et afficher une confirmation avec un numéro de référence unique.
4. IF un Client soumet un formulaire de Demande_Reparation avec des champs obligatoires manquants, THEN THE Application SHALL afficher un message d'erreur identifiant les champs manquants.
5. WHILE un Client est connecté, THE Application SHALL permettre à ce Client de consulter l'historique et le statut de ses Demandes_Reparation.

---

### Exigence 4 : Panier et Commande (Interface Client)

**User Story :** En tant que Client, je veux ajouter des produits à mon panier et passer une commande, afin d'acheter des téléphones ou des accessoires.

#### Critères d'Acceptation

1. WHEN un Client clique sur "Ajouter au panier" depuis la page d'un produit disponible, THE Application SHALL ajouter le produit au Panier et mettre à jour le compteur d'articles affiché dans la navigation.
2. WHEN un Client modifie la quantité d'un article dans le Panier, THE Application SHALL recalculer et afficher le sous-total et le total de la Commande.
3. WHEN un Client supprime un article du Panier, THE Application SHALL retirer l'article et mettre à jour le total.
4. WHILE le Panier est vide, THE Application SHALL afficher un message indiquant que le panier est vide et proposer un lien vers le Catalogue.
5. WHEN un Client valide sa Commande depuis le Panier, THE Commande_Service SHALL enregistrer la Commande avec le statut "En attente" et retourner un numéro de commande unique.
6. WHILE un Client est connecté, THE Application SHALL permettre à ce Client de consulter l'historique de ses Commandes avec leur statut.
7. IF le stock d'un produit devient insuffisant au moment de la validation de la Commande, THEN THE Commande_Service SHALL notifier le Client et lui proposer de mettre à jour son Panier.

---

### Exigence 5 : Gestion des Utilisateurs (Interface Admin)

**User Story :** En tant qu'Admin, je veux accéder à la liste des utilisateurs et gérer leurs comptes, afin de superviser les membres de la plateforme.

#### Critères d'Acceptation

1. WHILE un utilisateur est connecté avec le rôle Admin, THE Application SHALL afficher un tableau de bord d'administration accessible depuis une route dédiée et protégée.
2. WHEN un Admin accède à la section "Utilisateurs", THE Admin_Service SHALL retourner la liste paginée de tous les comptes utilisateurs avec leur nom, email, rôle et date d'inscription.
3. WHEN un Admin recherche un utilisateur par nom ou email, THE Admin_Service SHALL retourner les comptes correspondants.
4. WHEN un Admin modifie le rôle d'un utilisateur, THE Admin_Service SHALL mettre à jour le rôle en base de données et invalider les jetons actifs de cet utilisateur.
5. WHEN un Admin désactive un compte utilisateur, THE Admin_Service SHALL marquer le compte comme inactif et empêcher toute connexion future avec ce compte.
6. IF un Admin tente de désactiver son propre compte, THEN THE Admin_Service SHALL refuser l'opération et retourner un message d'erreur explicatif.

---

### Exigence 6 : Gestion du Catalogue Produits (Interface Admin)

**User Story :** En tant qu'Admin, je veux ajouter, modifier et supprimer des produits dans le catalogue, afin de maintenir l'offre à jour.

#### Critères d'Acceptation

1. WHEN un Admin accède à la section "Produits", THE Produit_Service SHALL retourner la liste paginée de tous les produits du Catalogue avec leur nom, catégorie, prix et niveau de stock.
2. WHEN un Admin soumet un formulaire d'ajout de produit valide contenant un nom, une catégorie, un prix et une quantité en stock, THE Produit_Service SHALL créer le produit en base de données et le rendre visible dans le Catalogue.
3. IF un Admin soumet un formulaire d'ajout de produit avec un prix négatif ou égal à zéro, THEN THE Produit_Service SHALL rejeter la requête et retourner un message d'erreur de validation.
4. WHEN un Admin modifie les informations d'un produit existant, THE Produit_Service SHALL mettre à jour le produit en base de données et refléter les changements dans le Catalogue.
5. WHEN un Admin supprime un produit, THE Produit_Service SHALL retirer le produit du Catalogue et retourner une confirmation de suppression.
6. IF un Admin tente de supprimer un produit associé à une Commande en cours, THEN THE Produit_Service SHALL refuser la suppression et retourner un message d'erreur indiquant les commandes concernées.
7. WHEN un Admin met à jour le stock d'un produit, THE Produit_Service SHALL enregistrer la nouvelle quantité et mettre à jour le statut de disponibilité affiché dans le Catalogue.

---

### Exigence 7 : Gestion des Services de Réparation (Interface Admin)

**User Story :** En tant qu'Admin, je veux ajouter et gérer les services de réparation proposés, afin de maintenir l'offre de réparation à jour.

#### Critères d'Acceptation

1. WHEN un Admin accède à la section "Services de Réparation", THE Admin_Service SHALL retourner la liste de tous les services de réparation avec leur nom, description et tarif.
2. WHEN un Admin soumet un formulaire d'ajout de service valide, THE Admin_Service SHALL créer le service en base de données et le rendre visible dans la page de réparation du Client.
3. WHEN un Admin modifie un service de réparation existant, THE Admin_Service SHALL mettre à jour le service en base de données et refléter les changements immédiatement pour les Clients.
4. WHEN un Admin supprime un service de réparation, THE Admin_Service SHALL retirer le service de la liste et retourner une confirmation.
5. IF un Admin tente de supprimer un service associé à une Demande_Reparation dont le statut est "En cours", THEN THE Admin_Service SHALL refuser la suppression et retourner un message d'erreur indiquant les demandes actives concernées.

---

### Exigence 8 : Gestion des Commandes et Demandes de Réparation (Interface Admin)

**User Story :** En tant qu'Admin, je veux visualiser et gérer les commandes et demandes de réparation, afin de traiter les demandes des Clients.

#### Critères d'Acceptation

1. WHEN un Admin accède à la section "Commandes", THE Commande_Service SHALL retourner la liste paginée de toutes les Commandes avec leur numéro, date, statut et montant total.
2. WHEN un Admin met à jour le statut d'une Commande, THE Commande_Service SHALL enregistrer le nouveau statut et notifier le Client concerné.
3. WHEN un Admin accède à la section "Demandes de Réparation", THE Admin_Service SHALL retourner la liste paginée de toutes les Demandes_Reparation avec leur référence, date, statut et service demandé.
4. WHEN un Admin met à jour le statut d'une Demande_Reparation, THE Admin_Service SHALL enregistrer le nouveau statut et notifier le Client concerné.

---

### Exigence 9 : Programme de Fidélité – Anti-Casse Gratuit

**User Story :** En tant que Client, je veux bénéficier d'un protège-écran gratuit après cinq achats, afin d'être récompensé pour ma fidélité.

#### Critères d'Acceptation

1. THE Fidelite_Service SHALL associer à chaque Client un compteur d'achats de Protege_Ecran, initialisé à zéro à la création du compte.
2. WHEN un Client valide une Commande contenant au moins un Protege_Ecran, THE Fidelite_Service SHALL incrémenter le compteur d'achats de Protege_Ecran de ce Client d'une unité par Protege_Ecran commandé.
3. WHEN le compteur d'achats de Protege_Ecran d'un Client atteint un multiple de cinq, THE Fidelite_Service SHALL générer un bon de réduction permettant d'obtenir le prochain Protege_Ecran gratuitement.
4. WHEN un Client ajoute un Protege_Ecran à son Panier en disposant d'un bon de réduction de fidélité valide, THE Application SHALL appliquer automatiquement la réduction et afficher un prix de 0 € pour cet article.
5. WHILE un Client est connecté, THE Application SHALL afficher le nombre d'achats de Protege_Ecran effectués et le nombre restant avant l'obtention du prochain article gratuit.
6. IF un Client annule une Commande contenant un Protege_Ecran dont l'achat a incrémenté le compteur, THEN THE Fidelite_Service SHALL décrémenter le compteur du nombre de Protege_Ecran annulés.

---

### Exigence 10 : Programme de Fidélité – Remise sur Réparation

**User Story :** En tant que Client, je veux bénéficier d'une remise de 50 % sur ma sixième réparation, afin d'être récompensé pour ma fidélité envers les services de réparation.

#### Critères d'Acceptation

1. THE Fidelite_Service SHALL associer à chaque Client un compteur de réparations effectuées, initialisé à zéro à la création du compte.
2. WHEN une Demande_Reparation d'un Client passe au statut "Téléphone prêt", THE Fidelite_Service SHALL incrémenter le compteur de réparations de ce Client d'une unité.
3. WHEN le compteur de réparations d'un Client atteint un multiple de cinq, THE Fidelite_Service SHALL générer un bon de réduction de 50 % applicable sur la prochaine réparation.
4. WHEN un Client soumet une Demande_Reparation en disposant d'un bon de réduction de réparation valide, THE Reparation_Service SHALL appliquer la remise de 50 % sur le tarif de la réparation et afficher le montant réduit dans la confirmation.
5. WHILE un Client est connecté, THE Application SHALL afficher le nombre de réparations effectuées et le nombre restant avant l'obtention de la prochaine remise de 50 %.

---

### Exigence 11 : Suivi de Réparation en Temps Réel (Interface Client)

**User Story :** En tant que Client, je veux suivre l'état de ma réparation en temps réel via l'application, afin d'être informé de l'avancement et de choisir les modalités de récupération de mon téléphone.

#### Critères d'Acceptation

1. WHILE un Client est connecté et dispose d'au moins une Demande_Reparation active, THE Application SHALL afficher pour chaque demande le Statut_Reparation courant ainsi que la date de dernière mise à jour.
2. WHEN le Statut_Reparation d'une Demande_Reparation est mis à jour, THE Application SHALL actualiser l'affichage du Statut_Reparation pour le Client concerné sans nécessiter de rechargement manuel de la page.
3. WHEN le Statut_Reparation d'une Demande_Reparation passe à "Téléphone prêt", THE Application SHALL afficher une notification au Client et présenter le choix de l'Option_Recuperation.
4. WHEN un Client sélectionne l'Option_Recuperation "récupération en boutique", THE Reparation_Service SHALL enregistrer ce choix et afficher les horaires et l'adresse de la boutique.
5. WHEN un Client sélectionne l'Option_Recuperation "livraison à domicile", THE Reparation_Service SHALL enregistrer ce choix et demander au Client de confirmer ou de saisir son adresse de livraison.
6. IF un Client tente d'accéder au suivi de réparation sans être authentifié, THEN THE Application SHALL rediriger le Client vers la page de connexion.

---

### Exigence 12 : Gestion du Suivi de Réparation (Interface Admin)

**User Story :** En tant qu'Admin, je veux accéder aux demandes de réparation et mettre à jour leur statut, afin de tenir les Clients informés de l'avancement des travaux.

#### Critères d'Acceptation

1. WHEN un Admin accède à la section "Suivi des Réparations", THE Reparation_Service SHALL retourner la liste paginée de toutes les Demandes_Reparation avec leur référence, modèle de téléphone, Statut_Reparation courant et date de dernière mise à jour.
2. WHEN un Admin met à jour le Statut_Reparation d'une Demande_Reparation, THE Reparation_Service SHALL accepter uniquement les valeurs "En attente", "Maintenance en cours" ou "Téléphone prêt" et rejeter toute autre valeur.
3. WHEN un Admin enregistre un nouveau Statut_Reparation pour une Demande_Reparation, THE Reparation_Service SHALL horodater la modification et notifier le Client concerné.
4. WHEN un Admin passe le Statut_Reparation d'une Demande_Reparation à "Téléphone prêt", THE Reparation_Service SHALL déclencher l'affichage du choix de l'Option_Recuperation dans l'interface Client.
5. WHEN un Admin consulte le détail d'une Demande_Reparation, THE Reparation_Service SHALL afficher l'historique complet des changements de Statut_Reparation avec leurs horodatages.
6. IF un Admin tente d'attribuer un Statut_Reparation antérieur au statut courant dans le flux de progression défini, THEN THE Reparation_Service SHALL refuser la mise à jour et retourner un message d'erreur explicatif.

---

### Exigence 13 : Sécurité et Autorisation

**User Story :** En tant qu'administrateur système, je veux que les accès soient strictement contrôlés par rôle, afin de protéger les données et les fonctionnalités sensibles.

#### Critères d'Acceptation

1. THE Authentification_Service SHALL stocker les mots de passe sous forme hachée en utilisant un algorithme de hachage à sens unique avec salage.
2. WHEN une requête est reçue sur une route protégée, THE Authentification_Service SHALL valider le jeton d'authentification avant d'autoriser l'accès à la ressource.
3. IF un jeton d'authentification est expiré ou invalide, THEN THE Authentification_Service SHALL retourner une erreur d'autorisation et rediriger l'utilisateur vers la page de connexion.
4. THE Application SHALL implémenter des guards Angular sur toutes les routes nécessitant une authentification ou un rôle spécifique.
5. WHILE un utilisateur n'est pas authentifié, THE Application SHALL rediriger toute tentative d'accès à une route protégée vers la page de connexion.

---

### Exigence 14 : Espace Questions / Diagnostic Client

**User Story :** En tant que Client, je veux pouvoir poser des questions sur mon problème de téléphone et joindre des photos, afin d'obtenir un diagnostic ou une réponse de l'Admin avant de déposer mon appareil.

#### Critères d'Acceptation

1. WHILE un Client est connecté, THE Application SHALL afficher un formulaire de Question contenant les champs : sujet, description du problème et import de photos.
2. WHEN un Client soumet un formulaire de Question valide, THE Diagnostic_Service SHALL enregistrer la Question avec les photos associées et retourner une confirmation avec un identifiant de Question unique.
3. IF un Client soumet un formulaire de Question avec le champ description vide, THEN THE Diagnostic_Service SHALL rejeter la soumission et afficher un message d'erreur identifiant le champ manquant.
4. WHEN un Client importe des photos dans le formulaire de Question, THE Diagnostic_Service SHALL accepter uniquement les fichiers de format JPEG, PNG ou WEBP d'une taille maximale de 5 Mo par fichier.
5. IF un Client tente d'importer un fichier dépassant 5 Mo ou dont le format n'est pas supporté, THEN THE Diagnostic_Service SHALL rejeter le fichier et afficher un message d'erreur précisant les contraintes acceptées.
6. WHEN un Admin répond à une Question, THE Diagnostic_Service SHALL enregistrer la réponse et notifier le Client concerné.
7. WHILE un Client est connecté, THE Application SHALL permettre à ce Client de consulter l'historique de ses Questions ainsi que les réponses apportées par l'Admin.
8. WHEN un Admin accède à la section "Questions / Diagnostic", THE Diagnostic_Service SHALL retourner la liste paginée de toutes les Questions avec leur identifiant, date de soumission, sujet et statut de réponse.
9. WHEN un Admin consulte le détail d'une Question, THE Diagnostic_Service SHALL afficher la description du problème, les photos importées et, le cas échéant, la réponse déjà fournie.

---

### Exigence 15 : Système de Notifications Admin

**User Story :** En tant qu'Admin, je veux recevoir une notification dans mon interface pour toute action d'un Client sur la plateforme, afin d'être informé en temps réel et de traiter les demandes rapidement.

#### Critères d'Acceptation

1. WHEN un Client valide une Commande, THE Notification_Service SHALL créer une Notification à destination de l'Admin indiquant le numéro de Commande, le nom du Client et la date de soumission.
2. WHEN un Client soumet une Demande_Reparation, THE Notification_Service SHALL créer une Notification à destination de l'Admin indiquant la référence de la Demande_Reparation, le modèle de téléphone et le nom du Client.
3. WHEN un Client soumet une Question, THE Notification_Service SHALL créer une Notification à destination de l'Admin indiquant l'identifiant de la Question, le sujet et le nom du Client.
4. WHEN un Client enregistre un choix d'Option_Recuperation, THE Notification_Service SHALL créer une Notification à destination de l'Admin indiquant la référence de la Demande_Reparation, le nom du Client et l'Option_Recuperation choisie.
5. WHILE un Admin est connecté, THE Application SHALL afficher le nombre de Notifications non lues dans le tableau de bord Admin.
6. WHEN un Admin accède à la section "Notifications" du tableau de bord, THE Notification_Service SHALL retourner la liste des Notifications triées par date décroissante, avec pour chaque Notification : le type d'événement, le nom du Client, la date et un lien vers l'élément concerné.
7. WHEN un Admin consulte une Notification, THE Notification_Service SHALL marquer cette Notification comme lue et décrémenter le compteur de Notifications non lues.
8. THE Notification_Service SHALL conserver l'historique de toutes les Notifications sans limitation de durée jusqu'à suppression explicite par l'Admin.

---

### Exigence 16 : Paiement à la Livraison

**User Story :** En tant que Client, je veux savoir que le paiement s'effectue uniquement à la livraison ou au retrait en boutique, afin de ne pas avoir à saisir d'informations bancaires en ligne.

#### Critères d'Acceptation

1. THE Application SHALL implémenter uniquement le mode de paiement Paiement_A_La_Livraison pour l'ensemble des Commandes de produits et des services de réparation.
2. WHEN un Client valide une Commande de produits, THE Commande_Service SHALL afficher un message de confirmation indiquant explicitement que le paiement s'effectuera à la livraison ou au retrait en boutique.
3. WHEN un Client valide une Demande_Reparation, THE Reparation_Service SHALL afficher un message de confirmation indiquant explicitement que le paiement du service s'effectuera au retrait en boutique ou à la livraison.
4. THE Application SHALL ne pas intégrer de formulaire de saisie de coordonnées bancaires, de module de paiement en ligne ni de passerelle de paiement tierce.
5. WHEN un Client sélectionne l'Option_Recuperation "livraison à domicile", THE Reparation_Service SHALL confirmer au Client que le règlement s'effectuera au moment de la remise du téléphone par le livreur.
6. WHEN un Client sélectionne l'Option_Recuperation "récupération en boutique", THE Reparation_Service SHALL confirmer au Client que le règlement s'effectuera en boutique lors du retrait.
