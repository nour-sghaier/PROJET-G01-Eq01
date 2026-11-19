class ApiConfig {
  // 10.0.2.2 = le PC vu depuis l'émulateur Android.
  // Téléphone réel : lancez avec --dart-define=API_URL=http://IP_DU_PC:3000/api
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );
}