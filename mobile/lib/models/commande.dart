class LigneCommande {
  final String? offreId;
  final String? panierId; // une ligne = une offre OU un panier surprise
  final String titre;
  final int quantite;
  final double prixUnitaire;

  LigneCommande({
    this.offreId,
    this.panierId,
    required this.titre,
    required this.quantite,
    required this.prixUnitaire,
  });

  double get sousTotal => quantite * prixUnitaire;

  factory LigneCommande.fromJson(Map<String, dynamic> j) => LigneCommande(
        offreId: j['offreId'],
        panierId: j['panierId'],
        titre: j['titre'] ?? '',
        quantite: (j['quantite'] as num).toInt(),
        prixUnitaire: (j['prixUnitaire'] as num).toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'offreId': offreId,
        'panierId': panierId,
        'quantite': quantite,
      };
}

class Commande {
  final String id;
  final String commerceId;
  final String commerceNom;
  final DateTime dateCommande;
  final double montantTotal;
  final String statut; // EN_ATTENTE_PAIEMENT, PAYEE, RECUPEREE, ANNULEE
  final List<LigneCommande> lignes;
  final String? qrCode; // présent seulement après paiement

  Commande({
    required this.id,
    required this.commerceId,
    this.commerceNom = '',
    required this.dateCommande,
    required this.montantTotal,
    required this.statut,
    required this.lignes,
    this.qrCode,
  });

  factory Commande.fromJson(Map<String, dynamic> j) => Commande(
        id: j['id'] ?? '',
        commerceId: j['commerceId'] ?? '',
        commerceNom: j['commerceNom'] ?? '',
        dateCommande: DateTime.parse(j['dateCommande']),
        montantTotal: (j['montantTotal'] as num).toDouble(),
        statut: j['statut'] ?? 'EN_ATTENTE_PAIEMENT',
        lignes: ((j['lignes'] ?? []) as List)
            .map((e) => LigneCommande.fromJson(e))
            .toList(),
        qrCode: j['qrCode'],
      );
}