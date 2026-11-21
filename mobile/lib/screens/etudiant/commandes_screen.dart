import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../models/commande.dart';
import '../../services/api_service.dart';
import '../../widgets/etat.dart';
import 'commande_detail_screen.dart';

/// Liste des commandes de l'étudiant.
class CommandesScreen extends StatefulWidget {
  const CommandesScreen({super.key});

  @override
  State<CommandesScreen> createState() => _CommandesScreenState();
}

class _CommandesScreenState extends State<CommandesScreen> {
  int _v = 0; // changer pour recharger

  Future<List<Commande>> _charger() async {
    final data = await ApiService().get('/orders/mine');
    return (data as List).map((e) => Commande.fromJson(e)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return AsyncView<List<Commande>>(
      key: ValueKey(_v),
      charger: _charger,
      builder: (context, commandes, recharger) {
        if (commandes.isEmpty) {
          return const Vide("Vous n'avez pas encore de commande.");
        }
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
                child: ListTile(
                  title: Text(c.commerceNom.isEmpty ? 'Commande' : c.commerceNom,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                      '${formatDateHeure(c.dateCommande)}\n${c.lignes.length} article(s)'),
                  isThreeLine: true,
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(formatPrix(c.montantTotal),
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      StatutBadge(c.statut),
                    ],
                  ),
                  onTap: () async {
                    await Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => CommandeDetailScreen(commande: c),
                    ));
                    if (mounted) setState(() => _v++);
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }
}
