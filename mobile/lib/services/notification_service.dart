import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

import 'api_service.dart';

/// Notifications push (Firebase Cloud Messaging).
/// Le token de l'appareil est envoyé au backend, qui envoie les notifications.
class NotificationService {
  static final messengerKey = GlobalKey<ScaffoldMessengerState>();
  static bool _ecouteActive = false;

  static Future<void> init(ApiService api) async {
    try {
      final fm = FirebaseMessaging.instance;
      await fm.requestPermission();
      final token = await fm.getToken();
      if (token != null) await _envoyer(api, token);

      if (_ecouteActive) return;
      _ecouteActive = true;
      fm.onTokenRefresh.listen((t) => _envoyer(api, t));
      // Application ouverte : on affiche la notification dans un bandeau.
      FirebaseMessaging.onMessage.listen((m) {
        final n = m.notification;
        if (n == null) return;
        final texte = [n.title, n.body].whereType<String>().join(' — ');
        messengerKey.currentState?.showSnackBar(SnackBar(content: Text(texte)));
      });
    } catch (_) {
      // Les notifications ne doivent jamais bloquer l'application.
    }
  }

  /// À la déconnexion : le token de l'appareil est supprimé pour que
  /// l'ancien compte ne reçoive plus les notifications de cet appareil.
  static Future<void> arreter() async {
    try {
      await FirebaseMessaging.instance.deleteToken();
    } catch (_) {}
  }

  static Future<void> _envoyer(ApiService api, String token) async {
    try {
      await api.post('/users/me/fcm-token', body: {'fcmToken': token});
    } catch (_) {}
  }
}
