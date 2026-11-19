class Commerce {
  final String id;
  final String nom;
  final String description;
  final String adresse;
  final String? telephone;
  final String? logo;
  final String type; // RESTAURANT ou CAFETERIA
  final String statutValidation; // EN_ATTENTE, VALIDE, REFUSE
  final double? latitude; // bonus Campus Radar
  final double? longitude;

  Commerce({
    required this.id,
    required this.nom,
    this.description = '',
    this.adresse = '',
    this.telephone,
    this.logo,
    this.type = 'RESTAURANT',
    this.statutValidation = 'EN_ATTENTE',
    this.latitude,
    this.longitude,
  });

  factory Commerce.fromJson(Map<String, dynamic> j) => Commerce(
        id: j['id'] ?? '',
        nom: j['nom'] ?? '',
        description: j['description'] ?? '',
        adresse: j['adresse'] ?? '',
        telephone: j['telephone'],
        logo: j['logo'],
        type: j['type'] ?? 'RESTAURANT',
        statutValidation: j['statutValidation'] ?? 'EN_ATTENTE',
        latitude: (j['latitude'] as num?)?.toDouble(),
        longitude: (j['longitude'] as num?)?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        'nom': nom,
        'description': description,
        'adresse': adresse,
        'telephone': telephone,
        'logo': logo,
        'type': type,
        'latitude': latitude,
        'longitude': longitude,
      };
}