import 'package:flutter/material.dart';

import '../../core/erreurs.dart';
import '../../models/offre.dart';
import '../../services/api_service.dart';
import '../../widgets/etat.dart';
import '../../widgets/offre_card.dart';
import 'offre_form_screen.dart';

/// Offres du commerçant : publier, modifier, supprimer.
class MesOffresScreen extends StatefulWidget {
  const MesOffresScreen({super.key});

  @override
  State<MesOffresScreen> createState() => _MesOffresScreenState();
}

class _MesOffresScreenState extends State<MesOffresScreen> {
  final _api = ApiService();
  int _v = 0;

  Future<List<Offre>> _charger() async {
    final data = await _api.get('/offers/mine');
    return (data as List).map((e) => Offre.fromJson(e)).toList();
  }

  Future<void> _ouvrirFormulaire([Offre? offre]) async {
    final ok = await Navigator.of(context).push<bool>(MaterialPageRoute(
      builder: (_) => OffreFormScreen(offre: offre),
    ));
    if (ok == true && mounted) setState(() => _v++);
  }

  Future<void> _supprimer(Offre o) async {
    final confirme = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Supprimer « ${o.titre} » ?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Annuler')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Supprimer')),
        ],
      ),
    );
    if (confirme != true) return;
    try {
      await _api.delete('/offers/${o.id}');
      if (mounted) setState(() => _v++);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(messageErreur(e))));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _ouvrirFormulaire(),
        icon: const Icon(Icons.add),
        label: const Text('Publier'),
      ),
      body: AsyncView<List<Offre>>(
        key: ValueKey(_v),
        charger: _charger,
        builder: (context, offres, recharger) {
          if (offres.isEmpty) {
            return const Vide("Aucune offre publiée.\nAppuyez sur « Publier » pour en ajouter une.");
          }
          return RefreshIndicator(
            onRefresh: recharger,
            child: ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(top: 6, bottom: 90),
              itemCount: offres.length,
              itemBuilder: (_, i) => OffreCard(
                offre: offres[i],
                onTap: () => _ouvrirFormulaire(offres[i]),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => _supprimer(offres[i]),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
