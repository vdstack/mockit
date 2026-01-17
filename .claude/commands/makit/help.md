---
name: makit:help
description: "Affiche la liste des commandes makit disponibles"
---

# Commandes makit

Affiche cette aide pour l'utilisateur.

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/makit:help` | Affiche cette aide |
| `/makit:brainstorm` | Lance une session de brainstorming interactive |
| `/makit:status` | Affiche l'état du projet makit |

## Architecture makit

makit utilise une architecture à 3 couches:

```
┌─────────────────────────────────────────────────────────────┐
│ COMMANDS (workflow explicite)                               │
│ L'utilisateur tape /makit:xxx pour lancer un workflow       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ AGENTS (exécuteurs spécialisés)                             │
│ Reçoivent des instructions + ont accès à des skills         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SKILLS (connaissance + outils réutilisables)                │
│ Techniques, méthodologies, scripts - partagés entre agents  │
└─────────────────────────────────────────────────────────────┘
```

## Agents disponibles

- **makit-brainstormer**: Transforme une idée vague en brief structuré
- **makit-shaper**: Découpe un brief en packages Shape Up (à venir)
- **makit-planner**: Planifie l'implémentation (à venir)
- **makit-verifier**: Vérifie la qualité (à venir)

## Skills disponibles

- **makit-brainstorming**: Techniques de brainstorming (5 Whys, SCAMPER, Mind Mapping, etc.)
- **makit-writing**: Guidelines de style markdown

## Pour commencer

Lance `/makit:brainstorm` pour démarrer une session de brainstorming sur ton idée.
