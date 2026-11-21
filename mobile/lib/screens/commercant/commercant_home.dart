import 'package:flutter/material.dart';

import '../../models/commerce.dart';
import '../dashboard_screen.dart';
import '../profil_screen.dart';
import 'commandes_recues_screen.dart';
import 'mes_offres_screen.dart';
import 'scan_screen.dart';

class CommercantHome extends StatefulWidget {
  final Commerce commerce;
  const CommercantHome({super.key, required this.commerce});

  @override
  State<CommercantHome> createState() => _CommercantHomeState();
}

class _CommercantHomeState extends State<CommercantHome> {
  int _i = 0;

  static const _titres = [
    'Mes offres',
    'Commandes reçues',
    'Scanner un QR code',
    'Tableau de bord',
    'Profil',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const MesOffresScreen(),
      const CommandesRecuesScreen(),
      const ScanScreen(),
      const DashboardScreen(),
      ProfilScreen(commerce: widget.commerce),
    ];
    return Scaffold(
      appBar: AppBar(title: Text(_titres[_i])),
      body: pages[_i],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _i,
        onDestinationSelected: (i) => setState(() => _i = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.local_offer_outlined), label: 'Offres'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Commandes'),
          NavigationDestination(icon: Icon(Icons.qr_code_scanner), label: 'Scanner'),
          NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Stats'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profil'),
        ],
      ),
    );
  }
}
