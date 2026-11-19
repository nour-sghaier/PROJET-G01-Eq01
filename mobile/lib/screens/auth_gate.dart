import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/utilisateur.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'placeholder_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.chargement) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (auth.utilisateur == null) {
      return const LoginScreen();
    }
    switch (auth.utilisateur!.role) {
      case Role.etudiant:
        return const PlaceholderScreen(titre: 'Espace Étudiant');
      case Role.commercant:
        return const PlaceholderScreen(titre: 'Espace Commerçant');
      case Role.admin:
        return const PlaceholderScreen(
            titre: "Administrateur : utilisez l'application web");
    }
  }
}