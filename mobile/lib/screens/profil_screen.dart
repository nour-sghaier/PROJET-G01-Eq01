import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/erreurs.dart';
import '../core/format.dart';
import '../models/commerce.dart';
import '../models/utilisateur.dart';
import '../providers/auth_provider.dart';
import 'commercant/commerce_form_screen.dart';

/// Profil (étudiant et commerçant) : modification + déconnexion.
class ProfilScreen extends StatefulWidget {
  final Commerce? commerce; // renseigné pour un commerçant
  const ProfilScreen({super.key, this.commerce});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  final _form = GlobalKey<FormState>();
  late final TextEditingController _prenom;
  late final TextEditingController _nom;
  late final TextEditingController _tel;
  bool _envoi = false;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    final u = context.read<AuthProvider>().utilisateur!;
    _prenom = TextEditingController(text: u.prenom);
    _nom = TextEditingController(text: u.nom);
    _tel = TextEditingController(text: u.telephone ?? '');
  }

  @override
  void dispose() {
    _prenom.dispose();
    _nom.dispose();
    _tel.dispose();
    super.dispose();
  }

  Future<void> _enregistrer() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    try {
      await context.read<AuthProvider>().modifierProfil(
            prenom: _prenom.text,
            nom: _nom.text,
            telephone: _tel.text,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Profil mis à jour')));
    } catch (e) {
      if (mounted) setState(() => _erreur = messageErreur(e));
    }
    if (mounted) setState(() => _envoi = false);
  }

  @override
  Widget build(BuildContext context) {
    final u = context.watch<AuthProvider>().utilisateur!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ListTile(
          leading: const Icon(Icons.email_outlined),
          title: Text(u.email),
          subtitle: Text(u.role == Role.commercant ? 'Commerçant' : 'Étudiant'),
        ),
        const SizedBox(height: 8),
        Form(
          key: _form,
          child: Column(
            children: [
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
            ],
          ),
        ),
        if (_erreur != null) ...[
          const SizedBox(height: 8),
          Text(_erreur!, style: const TextStyle(color: Colors.red)),
        ],
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _envoi ? null : _enregistrer,
          child: const Text('Enregistrer'),
        ),
        if (widget.commerce != null) ...[
          const SizedBox(height: 8),
          OutlinedButton.icon(
            icon: const Icon(Icons.store),
            label: const Text('Informations du commerce'),
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(
              builder: (_) => CommerceFormScreen(commerce: widget.commerce),
            )),
          ),
        ],
        const Divider(height: 32),
        OutlinedButton.icon(
          icon: const Icon(Icons.logout),
          label: const Text('Se déconnecter'),
          onPressed: () => context.read<AuthProvider>().deconnexion(),
        ),
      ],
    );
  }
}
