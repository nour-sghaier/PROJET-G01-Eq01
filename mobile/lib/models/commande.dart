import '../core/format.dart';

class LigneCommande {
  final String offreId;
  final String titre;
  final int quantite;
  final double prixUnitaire;

  LigneCommande({
    required this.offreId,
    required this.titre,
    required this.quantite,
    required this.prixUnitaire,
  });

  double get sousTotal => quantite * prixUnitaire;

  factory LigneCommande.fromJson(Map<String, dynamic> j) => LigneCommande(
        offreId: j['offreId'] ?? '',
        titre: j['titre'] ?? '',
        quantite: (j['quantite'] as num).toInt(),
        prixUnitaire: (j['prixUnitaire'] as num).toDouble(),
      );
}

class Commande {
  final String id;
  final String commerceId;
  final String commerceNom;
  final String etudiantNom; // renseigné pour le commerçant
  final DateTime dateCommande;
  final double montantTotal;
  final String statut; // EN_ATTENTE_PAIEMENT, PAYEE, RECUPEREE, ANNULEE
  final List<LigneCommande> lignes;
  final String? qrCode; // présent seulement après paiement

  Commande({
    required this.id,
    required this.commerceId,
    this.commerceNom = '',
    this.etudiantNom = '',
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
        etudiantNom: j['etudiantNom'] ?? '',
        dateCommande: parseDate(j['dateCommande']),
        montantTotal: (j['montantTotal'] as num).toDouble(),
        statut: j['statut'] ?? 'EN_ATTENTE_PAIEMENT',
        lignes: ((j['lignes'] ?? []) as List)
            .map((e) => LigneCommande.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        qrCode: j['qrCode'],
      );
}
