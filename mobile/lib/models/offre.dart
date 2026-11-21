import '../core/format.dart';

class Offre {
  final String id;
  final String commerceId;
  final String commerceNom;
  final String titre;
  final String description;
  final String? photo;
  final String categorie;
  final double prixInitial;
  final double prixReduit;
  final int quantiteDisponible;
  final DateTime heureDebutRecuperation;
  final DateTime heureFinRecuperation;
  final String statut; // ACTIVE, EPUISEE, EXPIREE

  Offre({
    required this.id,
    required this.commerceId,
    this.commerceNom = '',
    required this.titre,
    this.description = '',
    this.photo,
    this.categorie = '',
    required this.prixInitial,
    required this.prixReduit,
    required this.quantiteDisponible,
    required this.heureDebutRecuperation,
    required this.heureFinRecuperation,
    this.statut = 'ACTIVE',
  });

  /// Offre dont l'heure de fin de récupération est dépassée.
  bool get expiree =>
      statut == 'EXPIREE' || heureFinRecuperation.isBefore(DateTime.now());

  bool get estDisponible =>
      statut == 'ACTIVE' && quantiteDisponible > 0 && !expiree;

  factory Offre.fromJson(Map<String, dynamic> j) => Offre(
        id: j['id'] ?? '',
        commerceId: j['commerceId'] ?? '',
        commerceNom: j['commerceNom'] ?? '',
        titre: j['titre'] ?? '',
        description: j['description'] ?? '',
        photo: j['photo'],
        categorie: j['categorie'] ?? '',
        prixInitial: (j['prixInitial'] as num).toDouble(),
        prixReduit: (j['prixReduit'] as num).toDouble(),
        quantiteDisponible: (j['quantiteDisponible'] as num).toInt(),
        heureDebutRecuperation: parseDate(j['heureDebutRecuperation']),
        heureFinRecuperation: parseDate(j['heureFinRecuperation']),
        statut: j['statut'] ?? 'ACTIVE',
      );
}
