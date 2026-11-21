import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

/// Affiche la photo d'une offre : URL http ou image encodée en base64
/// (« data:image/jpeg;base64,... »). Placeholder si absente.
class PhotoOffre extends StatelessWidget {
  final String? photo;
  const PhotoOffre({super.key, this.photo});

  Widget _placeholder() => Container(
        color: Colors.green.shade50,
        child: Icon(Icons.fastfood, size: 40, color: Colors.green.shade300),
      );

  @override
  Widget build(BuildContext context) {
    final p = photo;
    if (p == null || p.isEmpty) return _placeholder();
    try {
      if (p.startsWith('http')) {
        return Image.network(
          p,
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
          errorBuilder: (_, __, ___) => _placeholder(),
        );
      }
      final bytes = base64Decode(p.contains(',') ? p.split(',').last : p);
      return Image.memory(
        bytes,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        gaplessPlayback: true,
        errorBuilder: (_, __, ___) => _placeholder(),
      );
    } catch (_) {
      return _placeholder();
    }
  }
}

/// Ouvre la galerie, réduit l'image, et la renvoie en base64.
/// (Stockée directement dans Firestore : pas besoin de Firebase Storage.)
Future<String?> choisirPhotoBase64() async {
  final f = await ImagePicker().pickImage(
    source: ImageSource.gallery,
    imageQuality: 50,
    maxWidth: 640,
  );
  if (f == null) return null;
  return 'data:image/jpeg;base64,${base64Encode(await f.readAsBytes())}';
}
