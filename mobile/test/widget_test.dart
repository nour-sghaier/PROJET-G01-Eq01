import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/core/format.dart';
import 'package:mobile/models/commande.dart';

void main() {
  test('formatPrix affiche 3 décimales et la devise', () {
    expect(formatPrix(3), '3.000 DT');
  });

  test('validateurs de formulaire', () {
    expect(Valid.email('a@b.tn'), isNull);
    expect(Valid.email('abc'), isNotNull);
    expect(Valid.motDePasse('12345'), isNotNull);
    expect(Valid.telephone('12345678'), isNull);
    expect(Valid.telephone('123'), isNotNull);
    expect(Valid.entierPositif('0'), isNotNull);
  });

  test('Commande.fromJson lit les lignes et le QR code', () {
    final c = Commande.fromJson({
      'id': 'c1',
      'commerceId': 'k1',
      'dateCommande': '2026-11-24T16:00:00.000Z',
      'montantTotal': 6,
      'statut': 'PAYEE',
      'qrCode': 'abc',
      'lignes': [
        {'offreId': 'o1', 'titre': 'Sandwich', 'quantite': 2, 'prixUnitaire': 3}
      ],
    });
    expect(c.lignes.first.sousTotal, 6);
    expect(c.qrCode, 'abc');
  });
}
