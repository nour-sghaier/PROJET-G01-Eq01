import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../providers/auth_provider.dart';
import 'inscription_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _mdp = TextEditingController();
  String? _erreur;
  bool _envoi = false;

  @override
  void dispose() {
    _email.dispose();
    _mdp.dispose();
    super.dispose();
  }

  Future<void> _connecter() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    try {
      await context.read<AuthProvider>().connexion(_email.text.trim(), _mdp.text);
    } catch (e) {
      if (mounted) setState(() => _erreur = messageErreur(e));
    }
    if (mounted) setState(() => _envoi = false);
  }

  @override
  Widget build(BuildContext context) {
    // Erreur de chargement du profil (affichée après un retour à cet écran).
    final erreurProfil = context.watch<AuthProvider>().erreur;
    final message = _erreur ?? erreurProfil;
    return Scaffold(
      appBar: AppBar(title: const Text('CampusSave')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _form,
          child: ListView(
            children: [
              const SizedBox(height: 16),
              const Icon(Icons.eco, size: 64, color: Colors.green),
              const SizedBox(height: 8),
              const Text(
                'Ensemble contre le gaspillage alimentaire',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: Valid.email,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _mdp,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Mot de passe'),
                validator: Valid.motDePasse,
              ),
              const SizedBox(height: 16),
              if (message != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(message, style: const TextStyle(color: Colors.red)),
                ),
              ElevatedButton(
                onPressed: _envoi ? null : _connecter,
                child: _envoi
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Se connecter'),
              ),
              TextButton(
                onPressed: _envoi
                    ? null
                    : () => Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => const InscriptionScreen(),
                        )),
                child: const Text("Pas de compte ? S'inscrire"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
