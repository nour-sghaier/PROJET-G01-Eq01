import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme.dart';
import 'providers/auth_provider.dart';
import 'screens/auth_gate.dart';
import 'services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const
      CampusSaveApp(),
    ),
  );
}

class CampusSaveApp extends StatelessWidget {
  const CampusSaveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CampusSave',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      scaffoldMessengerKey: NotificationService.messengerKey,
      home: const AuthGate(),
    );
  }
}
