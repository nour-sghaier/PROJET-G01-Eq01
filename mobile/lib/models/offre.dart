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
  final double poidsEstimeKg; // bonus Impact Dashboard
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
    this.poidsEstimeKg = 0,
    required this.heureDebutRecuperation,
    required this.heureFinRecuperation,
    this.statut = 'ACTIVE',
  });

  bool get estDisponible => statut == 'ACTIVE' && quantiteDisponible > 0;

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
        poidsEstimeKg: (j['poidsEstimeKg'] as num?)?.toDouble() ?? 0,
        heureDebutRecuperation: DateTime.parse(j['heureDebutRecuperation']),
        heureFinRecuperation: DateTime.parse(j['heureFinRecuperation']),
        statut: j['statut'] ?? 'ACTIVE',
      );

  Map<String, dynamic> toJson() => {
        'titre': titre,
        'description': description,
        'photo': photo,
        'categorie': categorie,
        'prixInitial': prixInitial,
        'prixReduit': prixReduit,
        'quantiteDisponible': quantiteDisponible,
        'poidsEstimeKg': poidsEstimeKg,
        'heureDebutRecuperation': heureDebutRecuperation.toIso8601String(),
        'heureFinRecuperation': heureFinRecuperation.toIso8601String(),
      };
}