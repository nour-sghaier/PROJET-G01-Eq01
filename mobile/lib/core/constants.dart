class ApiConfig {
  // 10.0.2.2 = ton PC vu depuis l'émulateur Android.
  // Téléphone réel : flutter run --dart-define=API_URL=http://IP_DU_PC:3000/api
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );

  // MODE TEST : tant que le backend n'existe pas, on fabrique le profil
  // à partir du compte Firebase. Mettre false dès que GET /users/me marche.
  static const bool useMockProfile = true;

  // Rôle simulé en mode test : 'etudiant', 'commercant' ou 'admin'
  static const String mockRole = 'etudiant';
}