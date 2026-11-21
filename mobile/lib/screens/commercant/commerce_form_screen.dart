import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants.dart';
import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../models/commerce.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

/// Inscription du commerce (premier = true) ou modification de ses informations.
class CommerceFormScreen extends StatefulWidget {
  final Commerce? commerce;
  final bool premier;
  final VoidCallback? onSaved;

  const CommerceFormScreen({
    super.key,
    this.commerce,
    this.premier = false,
    this.onSaved,
  });

  @override
  State<CommerceFormScreen> createState() => _CommerceFormScreenState();
}

class _CommerceFormScreenState extends State<CommerceFormScreen> {
  final _api = ApiService();
  final _form = GlobalKey<FormState>();
  late final TextEditingController _nom;
  late final TextEditingController _adresse;
  late final TextEditingController _tel;
  late final TextEditingController _description;
  late String _type;
  bool _envoi = false;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    final c = widget.commerce;
    _nom = TextEditingController(text: c?.nom ?? '');
    _adresse = TextEditingController(text: c?.adresse ?? '');
    _tel = TextEditingController(text: c?.telephone ?? '');
    _description = TextEditingController(text: c?.description ?? '');
    _type = c?.type ?? AppConst.typesCommerce.first;
  }

  @override
  void dispose() {
    _nom.dispose();
    _adresse.dispose();
    _tel.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _enregistrer() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    final body = {
      'nom': _nom.text.trim(),
      'type': _type,
      'adresse': _adresse.text.trim(),
      'telephone': _tel.text.trim(),
      'description': _description.text.trim(),
    };
    try {
      if (widget.commerce == null) {
        await _api.post('/commerces', body: body);
      } else {
        await _api.put('/commerces/me', body: body);
      }
      if (!mounted) return;
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Informations enregistrées')));
      }
      widget.onSaved?.call();
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
      appBar: AppBar(
        title: Text(widget.premier ? 'Inscrire mon commerce' : 'Mon commerce'),
        actions: [
          if (widget.premier)
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: 'Se déconnecter',
              onPressed: () => context.read<AuthProvider>().deconnexion(),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (widget.premier)
                const Padding(
                  padding: EdgeInsets.only(bottom: 16),
                  child: Text(
                    "Votre commerce sera visible par les étudiants après validation par l'administrateur.",
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              TextFormField(
                controller: _nom,
                decoration: const InputDecoration(labelText: 'Nom du commerce'),
                validator: Valid.requis,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _type,
                decoration: const InputDecoration(labelText: 'Type'),
                items: const [
                  DropdownMenuItem(value: 'RESTAURANT', child: Text('Restaurant')),
                  DropdownMenuItem(value: 'CAFETERIA', child: Text('Cafétéria')),
                ],
                onChanged: (v) => setState(() => _type = v ?? _type),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _adresse,
                decoration: const InputDecoration(labelText: 'Adresse'),
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
                controller: _description,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
              if (_erreur != null) ...[
                const SizedBox(height: 12),
                Text(_erreur!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _envoi ? null : _enregistrer,
                child: Text(widget.premier ? 'Inscrire mon commerce' : 'Enregistrer'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
