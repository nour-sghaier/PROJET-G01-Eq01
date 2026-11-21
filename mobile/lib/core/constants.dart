class ApiConfig {
  // 10.0.2.2 = le PC vu depuis l'émulateur Android.
  // Téléphone réel : flutter run --dart-define=API_URL=http://IP_DU_PC:3000/api
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );
}

class AppConst {
  static const categories = [
    'Plat chaud',
    'Sandwich',
    'Pâtisserie',
    'Boisson',
    'Fruits et légumes',
    'Autre',
  ];
  static const typesCommerce = ['RESTAURANT', 'CAFETERIA'];
}
