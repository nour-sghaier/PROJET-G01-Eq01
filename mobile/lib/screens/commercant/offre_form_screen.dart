import 'package:flutter/material.dart';

import '../../core/constants.dart';
import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../models/offre.dart';
import '../../services/api_service.dart';
import '../../widgets/photo.dart';

/// Publication (offre == null) ou modification d'une offre.
class OffreFormScreen extends StatefulWidget {
  final Offre? offre;
  const OffreFormScreen({super.key, this.offre});

  @override
  State<OffreFormScreen> createState() => _OffreFormScreenState();
}

class _OffreFormScreenState extends State<OffreFormScreen> {
  final _api = ApiService();
  final _form = GlobalKey<FormState>();
  late final TextEditingController _titre;
  late final TextEditingController _description;
  late final TextEditingController _prixInitial;
  late final TextEditingController _prixReduit;
  late final TextEditingController _quantite;
  String? _categorie;
  DateTime? _debut;
  DateTime? _fin;
  String? _photo;
  bool _envoi = false;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    final o = widget.offre;
    _titre = TextEditingController(text: o?.titre ?? '');
    _description = TextEditingController(text: o?.description ?? '');
    _prixInitial = TextEditingController(text: o?.prixInitial.toString() ?? '');
    _prixReduit = TextEditingController(text: o?.prixReduit.toString() ?? '');
    _quantite = TextEditingController(text: o?.quantiteDisponible.toString() ?? '');
    _categorie = (o != null && AppConst.categories.contains(o.categorie))
        ? o.categorie
        : null;
    _debut = o?.heureDebutRecuperation.toLocal();
    _fin = o?.heureFinRecuperation.toLocal();
    _photo = o?.photo;
  }

  @override
  void dispose() {
    for (final c in [_titre, _description, _prixInitial, _prixReduit, _quantite]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<DateTime?> _choisirDateHeure(DateTime? actuel) async {
    final maintenant = DateTime.now();
    final d = await showDatePicker(
      context: context,
      initialDate: actuel ?? maintenant,
      firstDate: maintenant.subtract(const Duration(days: 365)),
      lastDate: maintenant.add(const Duration(days: 365)),
    );
    if (d == null || !mounted) return null;
    final t = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(actuel ?? maintenant),
    );
    if (t == null) return null;
    return DateTime(d.year, d.month, d.day, t.hour, t.minute);
  }

  Future<void> _enregistrer() async {
    if (!_form.currentState!.validate()) return;
    final initial = versDouble(_prixInitial.text)!;
    final reduit = versDouble(_prixReduit.text)!;
    String? probleme;
    if (_categorie == null) {
      probleme = 'Choisissez une catégorie.';
    } else if (reduit >= initial) {
      probleme = 'Le prix réduit doit être inférieur au prix initial.';
    } else if (_debut == null || _fin == null) {
      probleme = 'Renseignez les horaires de récupération.';
    } else if (!_fin!.isAfter(_debut!)) {
      probleme = "L'heure de fin doit être après l'heure de début.";
    }
    if (probleme != null) {
      setState(() => _erreur = probleme);
      return;
    }

    setState(() {
      _envoi = true;
      _erreur = null;
    });
    final body = {
      'titre': _titre.text.trim(),
      'description': _description.text.trim(),
      'categorie': _categorie,
      'prixInitial': initial,
      'prixReduit': reduit,
      'quantiteDisponible': int.parse(_quantite.text.trim()),
      'heureDebutRecuperation': _debut!.toUtc().toIso8601String(),
      'heureFinRecuperation': _fin!.toUtc().toIso8601String(),
      if (_photo != null) 'photo': _photo,
    };
    try {
      if (widget.offre == null) {
        await _api.post('/offers', body: body);
      } else {
        await _api.put('/offers/${widget.offre!.id}', body: body);
      }
      if (mounted) Navigator.of(context).pop(true);
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
          title: Text(widget.offre == null ? 'Publier une offre' : "Modifier l'offre")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: 160,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: PhotoOffre(photo: _photo),
                ),
              ),
              TextButton.icon(
                icon: const Icon(Icons.photo_library_outlined),
                label: const Text('Choisir une photo'),
                onPressed: () async {
                  final p = await choisirPhotoBase64();
                  if (p != null && mounted) setState(() => _photo = p);
                },
              ),
              TextFormField(
                controller: _titre,
                decoration: const InputDecoration(labelText: 'Titre du produit'),
                validator: Valid.requis,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _description,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _categorie,
                decoration: const InputDecoration(labelText: 'Catégorie'),
                items: AppConst.categories
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) => setState(() => _categorie = v),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _prixInitial,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Prix initial (DT)'),
                      validator: Valid.nombrePositif,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _prixReduit,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Prix réduit (DT)'),
                      validator: Valid.nombrePositif,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _quantite,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Quantité disponible'),
                validator: Valid.entierPositif,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.schedule),
                label: Text(_debut == null
                    ? 'Début de récupération'
                    : 'Début : ${formatDateHeure(_debut!)}'),
                onPressed: () async {
                  final d = await _choisirDateHeure(_debut);
                  if (d != null) setState(() => _debut = d);
                },
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                icon: const Icon(Icons.schedule),
                label: Text(_fin == null
                    ? 'Fin de récupération'
                    : 'Fin : ${formatDateHeure(_fin!)}'),
                onPressed: () async {
                  final d = await _choisirDateHeure(_fin ?? _debut);
                  if (d != null) setState(() => _fin = d);
                },
              ),
              if (_erreur != null) ...[
                const SizedBox(height: 12),
                Text(_erreur!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _envoi ? null : _enregistrer,
                child: Text(widget.offre == null ? 'Publier' : 'Enregistrer'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
