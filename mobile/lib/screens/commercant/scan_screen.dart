import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../models/commande.dart';
import '../../services/api_service.dart';

/// Scan du QR code de l'étudiant pour valider la récupération de la commande.
/// Une saisie manuelle du code est prévue (émulateur sans caméra).
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final _api = ApiService();
  final _manuel = TextEditingController();
  bool _occupe = false;
  // Évite de re-valider en boucle le même QR code resté devant la caméra.
  String? _dernierCode;
  DateTime _dernierScan = DateTime.fromMillisecondsSinceEpoch(0);

  @override
  void dispose() {
    _manuel.dispose();
    super.dispose();
  }

  Future<void> _valider(String code) async {
    if (_occupe || code.trim().isEmpty) return;
    setState(() => _occupe = true);
    var titre = '';
    var message = '';
    try {
      final c = Commande.fromJson(
          await _api.post('/orders/validate-qr', body: {'qrCode': code.trim()}));
      titre = 'Commande validée ✔';
      message =
          '${c.etudiantNom.isEmpty ? 'Client' : c.etudiantNom} — ${formatPrix(c.montantTotal)}\n'
          '${c.lignes.map((l) => '${l.quantite} × ${l.titre}').join('\n')}';
      _manuel.clear();
    } catch (e) {
      titre = 'QR code refusé';
      message = messageErreur(e);
    }
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(titre),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
        ],
      ),
    );
    if (mounted) setState(() => _occupe = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          flex: 3,
          child: MobileScanner(
            onDetect: (capture) {
              final code = capture.barcodes.firstOrNull?.rawValue;
              if (code == null) return;
              final recent = DateTime.now().difference(_dernierScan) <
                  const Duration(seconds: 5);
              if (code == _dernierCode && recent) return;
              _dernierCode = code;
              _dernierScan = DateTime.now();
              _valider(code);
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _manuel,
                  decoration: const InputDecoration(
                    labelText: 'Ou saisir le code manuellement',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                icon: const Icon(Icons.check),
                onPressed: _occupe ? null : () => _valider(_manuel.text),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
