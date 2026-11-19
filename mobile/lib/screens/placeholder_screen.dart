import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class PlaceholderScreen extends StatelessWidget {
  final String titre;
  const PlaceholderScreen({super.key, required this.titre});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().utilisateur;
    return Scaffold(
      appBar: AppBar(
        title: Text(titre),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().deconnexion(),
          ),
        ],
      ),
      body: Center(
        child: Text(
          '$titre\n${user?.email ?? ''}',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}