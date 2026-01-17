---
name: makit:brainstorm
description: "Lance une session de brainstorming interactive"
---

# Commande brainstorm

Lance l'agent makit-brainstormer pour transformer une idée vague en brief structuré.

## Instructions

Tu dois lancer l'agent `makit-brainstormer` en utilisant le tool Task avec les paramètres suivants:

```
subagent_type: makit-brainstormer
prompt: [Le contexte de l'utilisateur ou "Démarre une nouvelle session de brainstorming"]
```

## Comportement attendu

1. Si l'utilisateur a fourni une idée avec la commande, passe-la à l'agent
2. Si aucune idée n'est fournie, l'agent demandera à l'utilisateur de décrire son idée
3. L'agent va:
   - Proposer une recherche sur le domaine (optionnel)
   - Recommander une technique de brainstorming
   - Mener une session interactive
   - Produire un brief structuré dans `.makit/brief.md`

## Exemple d'utilisation

```
/makit:brainstorm J'ai une idée d'app pour aider les gens à mieux dormir
```

ou simplement:

```
/makit:brainstorm
```

## Output

Le brief sera créé dans `.makit/brief.md` avec la structure suivante:
- L'idée en une phrase
- Contexte
- Objectifs
- Utilisateurs cibles
- Contraintes connues
- Premières idées / Directions
- Questions ouvertes
