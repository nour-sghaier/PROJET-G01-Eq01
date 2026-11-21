import 'package:flutter/material.dart';

import '../../models/commerce.dart';
import '../../services/api_service.dart';
import '../../widgets/etat.dart';
import 'commerce_form_screen.dart';
import 'commercant_home.dart';

/// Le commerçant doit d'abord inscrire son commerce, puis attendre
/// la validation de l'administrateur avant d'accéder à l'application.
class CommercantGate extends StatefulWidget {
  const CommercantGate({super.key});

  @override
  State<CommercantGate> createState() => _CommercantGateState();
}

class _CommercantGateState extends State<CommercantGate> {
  int _v = 0;

  Future<Commerce?> _charger() async {
    try {
      final d = await ApiService().get('/commerces/me');
      return d == null ? null : Commerce.fromJson(d);
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null; // pas encore de commerce
      rethrow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsyncView<Commerce?>(
        key: ValueKey(_v),
        charger: _charger,
        builder: (context, commerce, recharger) {
          if (commerce == null) {
            return CommerceFormScreen(
              premier: true,
              onSaved: () => setState(() => _v++),
            );
          }
          if (commerce.statutValidation == 'VALIDE') {
            return CommercantHome(commerce: commerce);
          }
          final refuse = commerce.statutValidation == 'REFUSE';
          return EcranMessage(
            titre: commerce.nom,
            message: refuse
                ? "Votre commerce a été refusé par l'administrateur."
                : "Votre commerce est en attente de validation par l'administrateur.",
            boutons: [
              ElevatedButton(
                onPressed: recharger,
                child: const Text('Actualiser'),
              ),
            ],
          );
        },
      ),
    );
  }
}
