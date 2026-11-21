import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../core/erreurs.dart';
import '../models/utilisateur.dart';
import '../services/api_service.dart';
import '../services/notification_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService api = ApiService();

  Utilisateur? utilisateur;
  bool chargement = true;
  String? erreur;

  // Vrai pendant l'inscription : le profil n'existe pas encore côté backend,
  // on ne doit donc pas essayer de le charger à la création du compte Firebase.
  bool _inscriptionEnCours = false;

  AuthProvider() {
    FirebaseAuth.instance.authStateChanges().listen(_onAuthChanged);
  }

  Future<void> _onAuthChanged(User? user) async {
    if (user == null) {
      utilisateur = null;
      chargement = false;
      notifyListeners();
      return;
    }
    if (_inscriptionEnCours) return;

    erreur = null;
    chargement = true;
    notifyListeners();
    try {
      final data = await api.get('/users/me');
      utilisateur = Utilisateur.fromJson(Map<String, dynamic>.from(data));
      NotificationService.init(api);
    } catch (e) {
      utilisateur = null;
      erreur = messageErreur(e);
      chargement = false;
      notifyListeners();
      // Retour à l'écran de connexion (sinon l'utilisateur resterait bloqué).
      await FirebaseAuth.instance.signOut();
      return;
    }
    chargement = false;
    notifyListeners();
  }

  Future<void> connexion(String email, String motDePasse) async {
    erreur = null;
    await FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: motDePasse,
    );
  }

  /// Crée le compte Firebase puis le profil (POST /users).
  /// Le rôle `admin` n'est jamais proposé : il est créé à la main dans Firestore.
  Future<void> inscription({
    required String email,
    required String motDePasse,
    required String prenom,
    required String nom,
    required String telephone,
    required Role role,
  }) async {
    erreur = null;
    _inscriptionEnCours = true;
    try {
      await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email,
        password: motDePasse,
      );
      final data = await api.post('/users', body: {
        'prenom': prenom.trim(),
        'nom': nom.trim(),
        'telephone': telephone.trim(),
        'role': role.name,
      });
      utilisateur = Utilisateur.fromJson(Map<String, dynamic>.from(data));
      chargement = false;
      notifyListeners();
      NotificationService.init(api);
    } catch (e) {
      // Profil non créé : on supprime le compte Firebase pour pouvoir recommencer.
      try {
        await FirebaseAuth.instance.currentUser?.delete();
      } catch (_) {}
      rethrow;
    } finally {
      _inscriptionEnCours = false;
    }
  }

  Future<void> modifierProfil({
    required String prenom,
    required String nom,
    required String telephone,
  }) async {
    final data = await api.put('/users/me', body: {
      'prenom': prenom.trim(),
      'nom': nom.trim(),
      'telephone': telephone.trim(),
    });
    utilisateur = Utilisateur.fromJson(Map<String, dynamic>.from(data));
    notifyListeners();
  }

  Future<void> deconnexion() async {
    await NotificationService.arreter();
    await FirebaseAuth.instance.signOut();
  }
}
