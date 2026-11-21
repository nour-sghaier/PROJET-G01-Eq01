import 'package:flutter/material.dart';

import '../../core/constants.dart';
import '../../models/offre.dart';
import '../../services/api_service.dart';
import '../../widgets/etat.dart';
import '../../widgets/offre_card.dart';
import 'offre_detail_screen.dart';

/// Liste des offres + recherche (produit/commerce), catégorie et prix max.
class OffresScreen extends StatefulWidget {
  const OffresScreen({super.key});

  @override
  State<OffresScreen> createState() => _OffresScreenState();
}

class _OffresScreenState extends State<OffresScreen> {
  final _api = ApiService();
  final _recherche = TextEditingController();
  final _prixMax = TextEditingController();
  String _q = '';
  String _prix = '';
  String? _categorie;

  @override
  void dispose() {
    _recherche.dispose();
    _prixMax.dispose();
    super.dispose();
  }

  void _appliquer() {
    FocusScope.of(context).unfocus();
    setState(() {
      _q = _recherche.text.trim();
      _prix = _prixMax.text.trim();
    });
  }

  Future<List<Offre>> _charger() async {
    final data = await _api.get('/offers', query: {
      if (_q.isNotEmpty) 'q': _q,
      if (_categorie != null) 'categorie': _categorie!,
      if (_prix.isNotEmpty) 'prixMax': _prix.replaceAll(',', '.'),
    });
    return (data as List).map((e) => Offre.fromJson(e)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
          child: Column(
            children: [
              TextField(
                controller: _recherche,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _appliquer(),
                decoration: InputDecoration(
                  hintText: 'Produit ou commerce',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.arrow_forward),
                    onPressed: _appliquer,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String?>(
                      initialValue: _categorie,
                      isExpanded: true,
                      decoration: const InputDecoration(labelText: 'Catégorie'),
                      items: [
                        const DropdownMenuItem<String?>(
                            value: null, child: Text('Toutes')),
                        ...AppConst.categories.map((c) =>
                            DropdownMenuItem<String?>(value: c, child: Text(c))),
                      ],
                      onChanged: (v) => setState(() => _categorie = v),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _prixMax,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      textInputAction: TextInputAction.search,
                      onSubmitted: (_) => _appliquer(),
                      decoration:
                          const InputDecoration(labelText: 'Prix max (DT)'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: AsyncView<List<Offre>>(
            key: ValueKey('$_q|$_categorie|$_prix'),
            charger: _charger,
            builder: (context, offres, recharger) {
              if (offres.isEmpty) {
                return const Vide('Aucune offre trouvée.');
              }
              return RefreshIndicator(
                onRefresh: recharger,
                child: ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(top: 6, bottom: 12),
                  itemCount: offres.length,
                  itemBuilder: (_, i) => OffreCard(
                    offre: offres[i],
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => OffreDetailScreen(offre: offres[i]),
                    )),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
