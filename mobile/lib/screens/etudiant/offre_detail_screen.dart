import 'package:flutter/material.dart';

import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../models/commande.dart';
import '../../models/offre.dart';
import '../../services/api_service.dart';
import '../../widgets/photo.dart';
import 'commande_detail_screen.dart';

/// Détail d'une offre : choix de la quantité puis réservation.
class OffreDetailScreen extends StatefulWidget {
  final Offre offre;
  const OffreDetailScreen({super.key, required this.offre});

  @override
  State<OffreDetailScreen> createState() => _OffreDetailScreenState();
}

class _OffreDetailScreenState extends State<OffreDetailScreen> {
  final _api = ApiService();
  int _qte = 1;
  bool _envoi = false;
  String? _erreur;

  Future<void> _reserver() async {
    final o = widget.offre;
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    try {
      final data = await _api.post('/orders', body: {
        'commerceId': o.commerceId,
        'lignes': [
          {'offreId': o.id, 'quantite': _qte},
        ],
      });
      final commande = Commande.fromJson(data);
      if (!mounted) return;
      // On passe directement à la commande pour la payer.
      Navigator.of(context).pushReplacement(MaterialPageRoute(
        builder: (_) => CommandeDetailScreen(commande: commande),
      ));
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
    final o = widget.offre;
    final dispo = o.estDisponible;
    return Scaffold(
      appBar: AppBar(title: Text(o.titre)),
      body: ListView(
        children: [
          SizedBox(height: 220, child: PhotoOffre(photo: o.photo)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(o.titre,
                    style: const TextStyle(
                        fontSize: 22, fontWeight: FontWeight.bold)),
                if (o.commerceNom.isNotEmpty)
                  Text(o.commerceNom,
                      style: const TextStyle(color: Colors.grey, fontSize: 15)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(formatPrix(o.prixReduit),
                        style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade800)),
                    const SizedBox(width: 10),
                    Text(formatPrix(o.prixInitial),
                        style: const TextStyle(
                            decoration: TextDecoration.lineThrough,
                            color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 12),
                if (o.description.isNotEmpty) Text(o.description),
                const SizedBox(height: 12),
                if (o.categorie.isNotEmpty) Text('Catégorie : ${o.categorie}'),
                Text(
                    'Récupération : ${formatDateHeure(o.heureDebutRecuperation)} → ${formatDateHeure(o.heureFinRecuperation)}'),
                Text('Quantité disponible : ${o.quantiteDisponible}'),
                const Divider(height: 32),
                if (!dispo)
                  Text(
                    o.expiree ? 'Cette offre est expirée.' : "Cette offre n'est plus disponible.",
                    style: const TextStyle(color: Colors.red, fontSize: 16),
                  )
                else ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quantité', style: TextStyle(fontSize: 16)),
                      Row(
                        children: [
                          IconButton.outlined(
                            icon: const Icon(Icons.remove),
                            onPressed: _qte > 1 ? () => setState(() => _qte--) : null,
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text('$_qte',
                                style: const TextStyle(
                                    fontSize: 20, fontWeight: FontWeight.bold)),
                          ),
                          IconButton.outlined(
                            icon: const Icon(Icons.add),
                            onPressed: _qte < o.quantiteDisponible
                                ? () => setState(() => _qte++)
                                : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Total : ${formatPrix(_qte * o.prixReduit)}',
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  if (_erreur != null) ...[
                    const SizedBox(height: 8),
                    Text(_erreur!, style: const TextStyle(color: Colors.red)),
                  ],
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _envoi ? null : _reserver,
                    child: _envoi
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('Réserver'),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
