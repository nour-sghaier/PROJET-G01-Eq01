import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../models/utilisateur.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService api = ApiService();

  Utilisateur? utilisateur;
  bool chargement = true;
  String? erreur;

  AuthProvider() {
    FirebaseAuth.instance.authStateChanges().listen(_onAuthChanged);
  }

  Future<void> _onAuthChanged(User? user) async {
    erreur = null;
    if (user == null) {
      utilisateur = null;
      chargement = false;
      notifyListeners();
      return;
    }
    chargement = true;
    notifyListeners();
    try {
      final data = await api.get('/users/me');
      utilisateur = Utilisateur.fromJson(data);
    } catch (e) {
      utilisateur = null;
      erreur = 'Impossible de charger le profil : $e';
    }
    chargement = false;
    notifyListeners();
  }

  Future<void> connexion(String email, String motDePasse) async {
    await FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: motDePasse,
    );
  }

  Future<void> deconnexion() async {
    await FirebaseAuth.instance.signOut();
  }
}
