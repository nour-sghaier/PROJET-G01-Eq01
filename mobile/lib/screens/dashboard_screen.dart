import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../models/utilisateur.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/etat.dart';

class _Stat {
  final String cle;
  final String label;
  final IconData icone;
  final bool argent;
  const _Stat(this.cle, this.label, this.icone, {this.argent = false});
}

const _statsEtudiant = [
  _Stat('nbCommandes', 'Commandes', Icons.receipt_long),
  _Stat('nbRecuperees', 'Récupérées', Icons.check_circle_outline),
  _Stat('totalDepense', 'Total dépensé', Icons.payments_outlined, argent: true),
  _Stat('totalEconomise', 'Économies réalisées', Icons.savings_outlined,
      argent: true),
];

const _statsCommercant = [
  _Stat('nbCommandes', 'Commandes reçues', Icons.receipt_long),
  _Stat('nbRecuperees', 'Commandes récupérées', Icons.check_circle_outline),
  _Stat('chiffreAffaires', "Chiffre d'affaires", Icons.payments_outlined,
      argent: true),
  _Stat('offresActives', 'Offres actives', Icons.local_offer_outlined),
];

/// Tableau de bord étudiant ou commerçant (GET /stats/me).
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final role = context.read<AuthProvider>().utilisateur!.role;
    final defs = role == Role.commercant ? _statsCommercant : _statsEtudiant;

    return AsyncView<Map<String, dynamic>>(
      charger: () async =>
          Map<String, dynamic>.from(await ApiService().get('/stats/me')),
      builder: (context, stats, recharger) => RefreshIndicator(
        onRefresh: recharger,
        child: GridView.count(
          physics: const AlwaysScrollableScrollPhysics(),
          crossAxisCount: 2,
          padding: const EdgeInsets.all(12),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.15,
          children: [
            for (final s in defs)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(s.icone, size: 30, color: Colors.green.shade700),
                      const SizedBox(height: 8),
                      Text(
                        s.argent
                            ? formatPrix((stats[s.cle] ?? 0) as num)
                            : ((stats[s.cle] ?? 0) as num).toInt().toString(),
                        style: const TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(s.label,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
