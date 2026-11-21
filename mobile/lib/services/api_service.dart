import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import '../core/constants.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiService {
  Future<Map<String, String>> _headers() async {
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('${ApiConfig.baseUrl}$path').replace(
          queryParameters: (query == null || query.isEmpty) ? null : query);

  dynamic _handle(http.Response r) {
    if (r.statusCode >= 200 && r.statusCode < 300) {
      if (r.body.isEmpty) return null;
      return jsonDecode(utf8.decode(r.bodyBytes));
    }
    String msg = 'Erreur ${r.statusCode}';
    try {
      final body = jsonDecode(utf8.decode(r.bodyBytes));
      if (body is Map && body['message'] != null) msg = body['message'];
    } catch (_) {}
    throw ApiException(r.statusCode, msg);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) async {
    final r = await http
        .get(_uri(path, query), headers: await _headers())
        .timeout(const Duration(seconds: 15));
    return _handle(r);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final r = await http
        .post(_uri(path), headers: await _headers(), body: jsonEncode(body ?? {}))
        .timeout(const Duration(seconds: 15));
    return _handle(r);
  }

  Future<dynamic> put(String path, {Map<String, dynamic>? body}) async {
    final r = await http
        .put(_uri(path), headers: await _headers(), body: jsonEncode(body ?? {}))
        .timeout(const Duration(seconds: 15));
    return _handle(r);
  }

  Future<dynamic> delete(String path) async {
    final r = await http
        .delete(_uri(path), headers: await _headers())
        .timeout(const Duration(seconds: 15));
    return _handle(r);
  }
}