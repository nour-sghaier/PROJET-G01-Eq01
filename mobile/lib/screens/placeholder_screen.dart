import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class PlaceholderScreen extends StatelessWidget {
  final String titre;
  final bool avecDeconnexion;
  const PlaceholderScreen({super.key, required this.titre, this.avecDeconnexion = true});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(titre),
        actions: [
          if (avecDeconnexion)
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () => context.read<AuthProvider>().deconnexion(),
            ),
        ],
      ),
      body: Center(child: Text(titre, style: const TextStyle(fontSize: 20))),
    );
  }
}