import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../models/commande.dart';
import '../../services/api_service.dart';
import '../../widgets/etat.dart';

/// Commandes reçues par le commerce.
/// Une commande payée est validée au retrait via l'onglet « Scanner ».
class CommandesRecuesScreen extends StatelessWidget {
  const CommandesRecuesScreen({super.key});

  Future<List<Commande>> _charger() async {
    final data = await ApiService().get('/orders/received');
    return (data as List).map((e) => Commande.fromJson(e)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return AsyncView<List<Commande>>(
      charger: _charger,
      builder: (context, commandes, recharger) {
        if (commandes.isEmpty) return const Vide('Aucune commande reçue.');
        return RefreshIndicator(
          onRefresh: recharger,
          child: ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(vertical: 6),
            itemCount: commandes.length,
            itemBuilder: (_, i) {
              final c = commandes[i];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: ExpansionTile(
                  title: Text(
                    '${c.etudiantNom.isEmpty ? 'Client' : c.etudiantNom} • ${formatPrix(c.montantTotal)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Wrap(
                        spacing: 8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(formatDateHeure(c.dateCommande)),
                          StatutBadge(c.statut),
                        ],
                      ),
                    ),
                  ),
                  children: [
                    for (final l in c.lignes)
                      ListTile(
                        dense: true,
                        title: Text('${l.quantite} × ${l.titre}'),
                        trailing: Text(formatPrix(l.sousTotal)),
                      ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }
}
