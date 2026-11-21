import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/erreurs.dart';
import '../core/format.dart';
import '../providers/auth_provider.dart';

/// Charge des données (Future) et gère automatiquement
/// chargement / erreur + bouton « Réessayer ».
/// Pour forcer un rechargement depuis l'extérieur : changer la `key`.
class AsyncView<T> extends StatefulWidget {
  final Future<T> Function() charger;
  final Widget Function(
    BuildContext context,
    T data,
    Future<void> Function() recharger,
  ) builder;

  const AsyncView({super.key, required this.charger, required this.builder});

  @override
  State<AsyncView<T>> createState() => _AsyncViewState<T>();
}

class _AsyncViewState<T> extends State<AsyncView<T>> {
  late Future<T> _futur;

  @override
  void initState() {
    super.initState();
    _futur = widget.charger();
  }

  Future<void> _recharger() async {
    final f = widget.charger();
    setState(() {
      _futur = f;
    });
    try {
      await f;
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: _futur,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snap.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    messageErreur(snap.error!),
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: _recharger,
                    child: const Text('Réessayer'),
                  ),
                ],
              ),
            ),
          );
        }
        return widget.builder(context, snap.data as T, _recharger);
      },
    );
  }
}

/// Écran plein avec un message (admin, commerce en attente, erreur de profil…).
class EcranMessage extends StatelessWidget {
  final String titre;
  final String message;
  final List<Widget> boutons;

  const EcranMessage({
    super.key,
    required this.titre,
    required this.message,
    this.boutons = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(titre),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Se déconnecter',
            onPressed: () => context.read<AuthProvider>().deconnexion(),
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              ...boutons,
            ],
          ),
        ),
      ),
    );
  }
}

class Vide extends StatelessWidget {
  final String message;
  const Vide(this.message, {super.key});

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.grey, fontSize: 16),
          ),
        ),
      );
}

class StatutBadge extends StatelessWidget {
  final String statut;
  const StatutBadge(this.statut, {super.key});

  @override
  Widget build(BuildContext context) {
    final c = couleurStatut(statut);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: c.withAlpha(30),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c),
      ),
      child: Text(
        libelleStatut(statut),
        style: TextStyle(color: c, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
