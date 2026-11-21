class Commerce {
  final String id;
  final String nom;
  final String description;
  final String adresse;
  final String? telephone;
  final String type; // RESTAURANT ou CAFETERIA
  final String statutValidation; // EN_ATTENTE, VALIDE, REFUSE

  Commerce({
    required this.id,
    required this.nom,
    this.description = '',
    this.adresse = '',
    this.telephone,
    this.type = 'RESTAURANT',
    this.statutValidation = 'EN_ATTENTE',
  });

  factory Commerce.fromJson(Map<String, dynamic> j) => Commerce(
        id: j['id'] ?? '',
        nom: j['nom'] ?? '',
        description: j['description'] ?? '',
        adresse: j['adresse'] ?? '',
        telephone: j['telephone'],
        type: j['type'] ?? 'RESTAURANT',
        statutValidation: j['statutValidation'] ?? 'EN_ATTENTE',
      );
}
