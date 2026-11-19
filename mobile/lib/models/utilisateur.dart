enum Role { etudiant, commercant, admin }

Role roleFromString(String? s) => Role.values.firstWhere(
      (r) => r.name == (s ?? '').toLowerCase(),
      orElse: () => Role.etudiant,
    );

class Utilisateur {
  final String id;
  final String nom;
  final String prenom;
  final String email;
  final String? telephone;
  final Role role;
  final int ecoPoints; // bonus EcoPoints

  Utilisateur({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    this.telephone,
    required this.role,
    this.ecoPoints = 0,
  });

  factory Utilisateur.fromJson(Map<String, dynamic> j) => Utilisateur(
        id: j['id'] ?? '',
        nom: j['nom'] ?? '',
        prenom: j['prenom'] ?? '',
        email: j['email'] ?? '',
        telephone: j['telephone'],
        role: roleFromString(j['role']),
        ecoPoints: (j['ecoPoints'] ?? 0) as int,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'nom': nom,
        'prenom': prenom,
        'email': email,
        'telephone': telephone,
        'role': role.name,
      };
}