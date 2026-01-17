---
name: makit:status
description: "Affiche l'état du projet makit"
---

# Commande status

Affiche l'état actuel du projet makit en vérifiant les fichiers dans `.makit/`.

## Instructions

1. Vérifie si le dossier `.makit/` existe
2. Liste les fichiers présents:
   - `.makit/brief.md` - Le brief du projet
   - `.makit/research/` - Les recherches effectuées
   - `.makit/packages/` - Les packages Shape Up (à venir)
   - `.makit/plan.md` - Le plan d'implémentation (à venir)

3. Affiche un résumé de l'état:
   - ✅ si le fichier existe
   - ⬜ si le fichier n'existe pas encore

## Format de sortie

```
📊 État du projet makit

Fichiers:
  [✅|⬜] .makit/brief.md        Brief du projet
  [✅|⬜] .makit/research/       Recherches
  [✅|⬜] .makit/packages/       Packages Shape Up
  [✅|⬜] .makit/plan.md         Plan d'implémentation

Prochaine étape recommandée: [selon l'état]
```

## Recommandations

- Si rien n'existe: "Lance `/makit:brainstorm` pour démarrer"
- Si brief existe: "Lance `/makit:shape` pour découper en packages" (à venir)
- Si packages existent: "Lance `/makit:plan` pour planifier" (à venir)
