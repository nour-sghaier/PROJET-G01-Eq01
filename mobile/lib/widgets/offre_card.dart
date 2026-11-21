import 'package:flutter/material.dart';

import '../core/format.dart';
import '../models/offre.dart';
import 'photo.dart';

class OffreCard extends StatelessWidget {
  final Offre offre;
  final VoidCallback? onTap;
  final Widget? trailing;

  const OffreCard({super.key, required this.offre, this.onTap, this.trailing});

  @override
  Widget build(BuildContext context) {
    final o = offre;
    final etat = o.expiree
        ? 'Expirée'
        : (o.quantiteDisponible <= 0 ? 'Épuisée' : 'Reste : ${o.quantiteDisponible}');
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Row(
          children: [
            SizedBox(width: 100, height: 110, child: PhotoOffre(photo: o.photo)),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(o.titre,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                    if (o.commerceNom.isNotEmpty)
                      Text(o.commerceNom,
                          style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(formatPrix(o.prixReduit),
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.green.shade800)),
                        Text(formatPrix(o.prixInitial),
                            style: const TextStyle(
                                decoration: TextDecoration.lineThrough,
                                color: Colors.grey,
                                fontSize: 12)),
                      ],
                    ),
                    Text(etat, style: const TextStyle(fontSize: 12)),
                    Text(
                        'Retrait ${formatHeure(o.heureDebutRecuperation)} - ${formatHeure(o.heureFinRecuperation)}',
                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}
