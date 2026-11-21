import 'package:flutter/material.dart';

/// Accepte une chaîne ISO, un timestamp en ms, ou un Timestamp Firestore
/// sérialisé ({_seconds: ..} / {seconds: ..}).
DateTime parseDate(dynamic v) {
  if (v is String) return DateTime.parse(v);
  if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
  if (v is Map) {
    final s = v['_seconds'] ?? v['seconds'];
    if (s is num) return DateTime.fromMillisecondsSinceEpoch(s.toInt() * 1000);
  }
  return DateTime.now();
}

String _2(int n) => n.toString().padLeft(2, '0');

String formatDate(DateTime d) {
  final l = d.toLocal();
  return '${_2(l.day)}/${_2(l.month)}/${l.year}';
}

String formatHeure(DateTime d) {
  final l = d.toLocal();
  return '${_2(l.hour)}:${_2(l.minute)}';
}

String formatDateHeure(DateTime d) => '${formatDate(d)} ${formatHeure(d)}';

String formatPrix(num v) => '${v.toStringAsFixed(3)} DT';

double? versDouble(String s) => double.tryParse(s.trim().replaceAll(',', '.'));

String libelleStatut(String s) {
  switch (s) {
    case 'EN_ATTENTE_PAIEMENT':
      return 'En attente de paiement';
    case 'PAYEE':
      return 'Payée';
    case 'RECUPEREE':
      return 'Récupérée';
    case 'ANNULEE':
      return 'Annulée';
    case 'ACTIVE':
      return 'Active';
    case 'EPUISEE':
      return 'Épuisée';
    case 'EXPIREE':
      return 'Expirée';
    case 'EN_ATTENTE':
      return 'En attente';
    case 'VALIDE':
      return 'Validé';
    case 'REFUSE':
      return 'Refusé';
    default:
      return s;
  }
}

Color couleurStatut(String s) {
  switch (s) {
    case 'PAYEE':
      return Colors.blue;
    case 'RECUPEREE':
    case 'VALIDE':
    case 'ACTIVE':
      return Colors.green;
    case 'ANNULEE':
    case 'REFUSE':
    case 'EXPIREE':
    case 'EPUISEE':
      return Colors.red;
    default:
      return Colors.orange;
  }
}

/// Validateurs de formulaires.
class Valid {
  static String? requis(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Champ obligatoire' : null;

  static String? email(String? v) {
    if (v == null || v.trim().isEmpty) return 'Champ obligatoire';
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v.trim());
    return ok ? null : 'Email invalide';
  }

  static String? motDePasse(String? v) {
    if (v == null || v.isEmpty) return 'Champ obligatoire';
    return v.length < 6 ? 'Minimum 6 caractères' : null;
  }

  /// Facultatif : vide accepté, sinon 8 chiffres (numéro tunisien).
  static String? telephone(String? v) {
    if (v == null || v.trim().isEmpty) return null;
    return RegExp(r'^\d{8}$').hasMatch(v.trim()) ? null : 'Numéro à 8 chiffres';
  }

  static String? nombrePositif(String? v) {
    final n = versDouble(v ?? '');
    return (n == null || n <= 0) ? 'Nombre > 0 requis' : null;
  }

  static String? entierPositif(String? v) {
    final n = int.tryParse((v ?? '').trim());
    return (n == null || n <= 0) ? 'Entier > 0 requis' : null;
  }
}
