import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../models/utilisateur.dart';
import '../../providers/auth_provider.dart';

/// Inscription d'un étudiant ou d'un commerçant.
class InscriptionScreen extends StatefulWidget {
  const InscriptionScreen({super.key});

  @override
  State<InscriptionScreen> createState() => _InscriptionScreenState();
}

class _InscriptionScreenState extends State<InscriptionScreen> {
  final _form = GlobalKey<FormState>();
  final _prenom = TextEditingController();
  final _nom = TextEditingController();
  final _tel = TextEditingController();
  final _email = TextEditingController();
  final _mdp = TextEditingController();
  final _confirmation = TextEditingController();
  Role _role = Role.etudiant;
  bool _envoi = false;
  String? _erreur;

  @override
  void dispose() {
    for (final c in [_prenom, _nom, _tel, _email, _mdp, _confirmation]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _inscrire() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    try {
      await context.read<AuthProvider>().inscription(
            email: _email.text.trim(),
            motDePasse: _mdp.text,
            prenom: _prenom.text,
            nom: _nom.text,
            telephone: _tel.text,
            role: _role,
          );
      // Le compte est créé : AuthGate affiche l'espace du rôle.
      // On retire cet écran pour qu'il ne reste pas par-dessus.
      if (mounted) Navigator.of(context).popUntil((r) => r.isFirst);
    } catch (e) {
      if (mounted) {
        setState(() {
          _erreur = messageErreur(e);
          _envoi = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inscription')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SegmentedButton<Role>(
                segments: const [
                  ButtonSegment(
                      value: Role.etudiant,
                      label: Text('Étudiant'),
                      icon: Icon(Icons.school_outlined)),
                  ButtonSegment(
                      value: Role.commercant,
                      label: Text('Commerçant'),
                      icon: Icon(Icons.store_outlined)),
                ],
                selected: {_role},
                onSelectionChanged: (s) => setState(() => _role = s.first),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _prenom,
                decoration: const InputDecoration(labelText: 'Prénom'),
                validator: Valid.requis,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nom,
                decoration: const InputDecoration(labelText: 'Nom'),
                validator: Valid.requis,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _tel,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Téléphone'),
                validator: Valid.telephone,
              ),
              const SizedBox(height: 12),
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
              const SizedBox(height: 12),
              TextFormField(
                controller: _confirmation,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'Confirmer le mot de passe'),
                validator: (v) =>
                    v != _mdp.text ? 'Les mots de passe ne correspondent pas' : null,
              ),
              if (_erreur != null) ...[
                const SizedBox(height: 12),
                Text(_erreur!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _envoi ? null : _inscrire,
                child: _envoi
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text("S'inscrire"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
