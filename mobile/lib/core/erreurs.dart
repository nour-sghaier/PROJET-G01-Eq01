import 'dart:async';
import 'dart:io';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import '../services/api_service.dart';

/// Transforme n'importe quelle erreur en message lisible pour l'utilisateur.
String messageErreur(Object e) {
  if (e is ApiException) return e.message;
  if (e is FirebaseAuthException) {
    switch (e.code) {
      case 'invalid-credential':
      case 'wrong-password':
      case 'user-not-found':
        return 'Email ou mot de passe incorrect.';
      case 'email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'weak-password':
        return 'Mot de passe trop faible (6 caractères minimum).';
      case 'invalid-email':
        return 'Email invalide.';
      case 'network-request-failed':
        return 'Pas de connexion internet.';
      case 'too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard.';
      default:
        return "Erreur d'authentification (${e.code}).";
    }
  }
  if (e is TimeoutException ||
      e is SocketException ||
      e is http.ClientException) {
    return 'Serveur injoignable. Vérifiez que le backend est lancé et que API_URL est correcte.';
  }
  return 'Une erreur est survenue.';
}
