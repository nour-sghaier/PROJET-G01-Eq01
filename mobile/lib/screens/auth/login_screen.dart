import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
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
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    try {
      await context.read<AuthProvider>().connexion(_email.text.trim(), _mdp.text);
    } catch (e) {
      setState(() => _erreur = 'Connexion impossible : vérifiez vos identifiants');
    }
    if (mounted) setState(() => _envoi = false);
  }

  @override
  Widget build(BuildContext context) {
    final erreurProfil = context.watch<AuthProvider>().erreur;
    return Scaffold(
      appBar: AppBar(title: const Text('CampusSave')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: ListView(
          children: [
            const SizedBox(height: 24),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _mdp,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Mot de passe'),
            ),
            const SizedBox(height: 16),
            if (_erreur != null || erreurProfil != null)
              Text(_erreur ?? erreurProfil!,
                  style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _envoi ? null : _connecter,
              child: _envoi
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Se connecter'),
            ),
          ],
        ),
      ),
    );
  }
}