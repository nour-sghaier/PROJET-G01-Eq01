import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/erreurs.dart';
import '../../core/format.dart';
import '../../models/commande.dart';
import '../../services/api_service.dart';
import '../../widgets/etat.dart';

/// Détail d'une commande : paiement Konnect, annulation, QR code.
class CommandeDetailScreen extends StatefulWidget {
  final Commande commande;
  const CommandeDetailScreen({super.key, required this.commande});

  @override
  State<CommandeDetailScreen> createState() => _CommandeDetailScreenState();
}

class _CommandeDetailScreenState extends State<CommandeDetailScreen>
    with WidgetsBindingObserver {
  final _api = ApiService();
  late Commande _c;
  bool _envoi = false;
  String? _erreur;
  String? _info;

  @override
  void initState() {
    super.initState();
    _c = widget.commande;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Au retour du navigateur (après paiement), on actualise la commande.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _rafraichir();
  }

  Future<void> _rafraichir() async {
    try {
      final data = await _api.get('/orders/${_c.id}');
      if (mounted) setState(() => _c = Commande.fromJson(data));
    } catch (_) {}
  }

  Future<void> _payer() async {
    setState(() {
      _envoi = true;
      _erreur = null;
      _info = null;
    });
    try {
      final data = await _api.post('/orders/${_c.id}/pay');
      final url = data['payUrl'] as String;
      final ok =
          await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      if (!ok) throw ApiException(0, "Impossible d'ouvrir la page de paiement.");
      if (mounted) {
        setState(() => _info =
            "Terminez le paiement puis revenez ici. Le QR code s'affichera une fois le paiement confirmé.");
      }
    } catch (e) {
      if (mounted) setState(() => _erreur = messageErreur(e));
    }
    if (mounted) setState(() => _envoi = false);
  }

  Future<void> _annuler() async {
    final confirme = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Annuler la commande ?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Non')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Oui, annuler')),
        ],
      ),
    );
    if (confirme != true) return;
    setState(() {
      _envoi = true;
      _erreur = null;
    });
    try {
      await _api.post('/orders/${_c.id}/cancel');
      await _rafraichir();
    } catch (e) {
      if (mounted) setState(() => _erreur = messageErreur(e));
    }
    if (mounted) setState(() => _envoi = false);
  }

  @override
  Widget build(BuildContext context) {
    final c = _c;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ma commande'),
        actions: [
          IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Actualiser',
              onPressed: _rafraichir),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(c.commerceNom,
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold)),
              ),
              StatutBadge(c.statut),
            ],
          ),
          Text(formatDateHeure(c.dateCommande),
              style: const TextStyle(color: Colors.grey)),
          const Divider(height: 28),
          for (final l in c.lignes)
            ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              title: Text('${l.quantite} × ${l.titre}'),
              trailing: Text(formatPrix(l.sousTotal)),
            ),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(formatPrix(c.montantTotal),
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 20),
          if (_erreur != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_erreur!, style: const TextStyle(color: Colors.red)),
            ),
          if (_info != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_info!, style: const TextStyle(color: Colors.blue)),
            ),
          if (c.statut == 'EN_ATTENTE_PAIEMENT') ...[
            ElevatedButton.icon(
              icon: const Icon(Icons.payment),
              label: const Text('Payer en ligne'),
              onPressed: _envoi ? null : _payer,
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: _envoi ? null : _annuler,
              child: const Text('Annuler la commande'),
            ),
          ],
          if (c.statut == 'PAYEE' && c.qrCode != null) ...[
            const Text(
              'Présentez ce QR code au commerçant pour récupérer votre commande.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Center(
              child: QrImageView(
                data: c.qrCode!,
                size: 240,
                backgroundColor: Colors.white,
              ),
            ),
          ],
          if (c.statut == 'RECUPEREE')
            const Text('Commande récupérée. Merci pour votre geste anti-gaspillage !',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.green, fontSize: 16)),
          if (c.statut == 'ANNULEE')
            const Text('Cette commande a été annulée.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red, fontSize: 16)),
        ],
      ),
    );
  }
}
