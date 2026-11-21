import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/utilisateur.dart';
import '../providers/auth_provider.dart';
import '../widgets/etat.dart';
import 'auth/login_screen.dart';
import 'commercant/commercant_gate.dart';
import 'etudiant/etudiant_home.dart';

/// Aiguille l'utilisateur selon son état : chargement, connexion, ou espace du rôle.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.chargement) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final u = auth.utilisateur;
    if (u == null) {
      return const LoginScreen();
    }
    switch (u.role) {
      case Role.etudiant:
        return const EtudiantHome();
      case Role.commercant:
        return const CommercantGate();
      case Role.admin:
        return const EcranMessage(
          titre: 'Administrateur',
          message:
              "L'espace administrateur est disponible uniquement sur l'application web.",
        );
    }
  }
}
