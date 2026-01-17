---
name: makit-writing
description: "Guidelines de style pour la rédaction de documents markdown"
---

# Skill: Writing

Ce skill fournit des guidelines de style pour la rédaction de documents markdown cohérents et professionnels.

## Principes généraux

### Clarté avant tout
- Une idée par phrase
- Un sujet par paragraphe
- Éviter le jargon inutile
- Préférer les mots simples aux mots complexes

### Structure hiérarchique
- Utiliser les niveaux de titres (`#`, `##`, `###`) de manière logique
- Ne pas sauter de niveau (pas de `###` après `#`)
- Maximum 3-4 niveaux de profondeur

### Concision
- Aller droit au but
- Supprimer les mots inutiles
- "En raison du fait que" → "Parce que"
- "Dans le but de" → "Pour"

## Formatage markdown

### Titres
```markdown
# Titre principal (un seul par document)

## Section majeure

### Sous-section

#### Détail (utiliser avec parcimonie)
```

### Listes
- Utiliser `-` pour les listes non ordonnées
- Utiliser `1.` pour les listes ordonnées
- Indenter avec 2 espaces pour les sous-listes

```markdown
- Premier item
  - Sous-item
  - Autre sous-item
- Deuxième item

1. Étape 1
2. Étape 2
3. Étape 3
```

### Emphase
- **Gras** pour les concepts importants
- *Italique* pour les termes techniques ou citations
- `Code inline` pour les commandes, noms de fichiers, variables

### Code blocks
Toujours spécifier le langage :

```markdown
```javascript
const example = "Hello";
```
```

### Tableaux
Pour les comparaisons et données structurées :

```markdown
| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Valeur 1  | Valeur 2  |
```

### Citations
Pour les insights ou références importantes :

```markdown
> Citation importante ou insight clé
```

## Style de rédaction

### Ton
- **Professionnel** : pas de familiarité excessive
- **Direct** : pas de formules alambiquées
- **Actionnable** : le lecteur sait quoi faire après avoir lu

### Voix active vs passive
- Préférer la voix active : "L'utilisateur clique" vs "Le bouton est cliqué"
- La voix passive est acceptable pour les descriptions techniques

### Formulations à éviter
| Éviter | Préférer |
|--------|----------|
| "Il est important de noter que..." | Aller directement au point |
| "Comme mentionné précédemment..." | Répéter l'info si nécessaire |
| "En conclusion..." | Conclure directement |
| "Etc." | Lister explicitement ou utiliser "..." |

## Structure des documents

### Brief (`.makit/brief.md`)
```markdown
# Brief : [Nom]

## L'idée en une phrase
[Max 2 lignes]

## Contexte
[Pourquoi ce projet ?]

## Objectifs
- [Objectif mesurable 1]
- [Objectif mesurable 2]

## Utilisateurs cibles
[Qui et pourquoi]

## Contraintes connues
- [Contrainte 1]
- [Contrainte 2]

## Questions ouvertes
- [Question 1]
- [Question 2]
```

### Documentation technique
```markdown
# [Nom du composant/feature]

## Description
[Quoi et pourquoi]

## Usage
[Comment l'utiliser avec exemples]

## API / Interface
[Détails techniques]

## Exemples
[Code exemples]

## Notes
[Cas particuliers, limitations]
```

## Checklist de qualité

Avant de finaliser un document :

- [ ] Le titre reflète le contenu
- [ ] La structure est logique et progressive
- [ ] Pas de fautes d'orthographe/grammaire
- [ ] Les listes sont cohérentes (même format)
- [ ] Le code est correctement formaté
- [ ] Les liens fonctionnent
- [ ] Le document est actionnable (le lecteur sait quoi faire)
