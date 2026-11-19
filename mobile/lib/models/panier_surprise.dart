class PanierSurprise {
  final String id;
  final String commerceId;
  final String commerceNom;
  final String titre;
  final String description;
  final double prixValeurEstimee;
  final double prixReduit;
  final int quantiteDisponible;
  final double poidsEstimeKg;
  final DateTime heureDebutRecuperation;
  final DateTime heureFinRecuperation;
  final String statut;

  PanierSurprise({
    required this.id,
    required this.commerceId,
    this.commerceNom = '',
    required this.titre,
    this.description = '',
    required this.prixValeurEstimee,
    required this.prixReduit,
    required this.quantiteDisponible,
    this.poidsEstimeKg = 0,
    required this.heureDebutRecuperation,
    required this.heureFinRecuperation,
    this.statut = 'ACTIVE',
  });

  factory PanierSurprise.fromJson(Map<String, dynamic> j) => PanierSurprise(
        id: j['id'] ?? '',
        commerceId: j['commerceId'] ?? '',
        commerceNom: j['commerceNom'] ?? '',
        titre: j['titre'] ?? '',
        description: j['description'] ?? '',
        prixValeurEstimee: (j['prixValeurEstimee'] as num).toDouble(),
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
        'prixValeurEstimee': prixValeurEstimee,
        'prixReduit': prixReduit,
        'quantiteDisponible': quantiteDisponible,
        'poidsEstimeKg': poidsEstimeKg,
        'heureDebutRecuperation': heureDebutRecuperation.toIso8601String(),
        'heureFinRecuperation': heureFinRecuperation.toIso8601String(),
      };
}