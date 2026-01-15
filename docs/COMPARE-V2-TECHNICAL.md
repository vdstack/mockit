# Compare V2 - Documentation Technique

## Vue d'ensemble

Compare V2 est une réécriture complète de la fonction `compare` de mockit. Elle remplace l'ancienne implémentation récursive par une architecture modulaire avec :
- Détection des références circulaires
- Gestion `undefined` = clé absente
- Messages d'erreur détaillés avec chemins et diffs visuels

## Architecture des dossiers

```
src/argsComparisons/
├── compare.ts                    # Point d'entrée (wrapper rétrocompatible)
└── compare-v2/
    ├── index.ts                  # Fonction principale compare()
    ├── types.ts                  # Tous les types TypeScript
    ├── context.ts                # Gestion du contexte de comparaison
    ├── result.ts                 # Builders pour créer les résultats
    ├── comparators/              # Comparaison par type de valeur
    │   ├── index.ts              # Dispatcher principal
    │   ├── primitive-comparator.ts
    │   ├── object-comparator.ts
    │   ├── array-comparator.ts
    │   ├── map-comparator.ts
    │   └── set-comparator.ts
    ├── matchers/                 # Handlers pour les matchers mockit
    │   ├── index.ts              # Détection + dispatcher
    │   ├── any-matcher.ts        # anyString(), anyNumber(), etc.
    │   ├── containing-matcher.ts # objectContaining(), arrayContaining(), etc.
    │   ├── containing-deep-matcher.ts
    │   ├── validate-matcher.ts   # validates() avec Zod ou fonction custom
    │   ├── or-matcher.ts         # or(), isOneOf()
    │   ├── string-matcher.ts     # stringStartingWith(), stringMatching(), etc.
    │   └── instance-of-matcher.ts
    └── formatters/               # Formatage des erreurs
        ├── index.ts              # Dispatcher principal
        ├── structured-formatter.ts  # Rapport texte chemin par chemin
        ├── visual-formatter.ts      # Diff visuel avec jest-diff
        └── matcher-plugin.ts        # Plugin pretty-format pour les matchers
```

## Types principaux

### `CompareResult`
Le résultat d'une comparaison :
```typescript
interface CompareResult {
  success: boolean;
  mismatches: MismatchInfo[];  // Liste des différences trouvées
}
```

### `MismatchInfo`
Décrit une différence :
```typescript
interface MismatchInfo {
  path: Path;           // Chemin structuré: [{ type: "property", key: "user" }, { type: "index", index: 0 }]
  pathString: string;   // Chemin lisible: "user[0].name"
  actual: unknown;      // Valeur reçue
  expected: unknown;    // Valeur attendue
  kind: MismatchKind;   // Type: "value_mismatch", "type_mismatch", "missing_property", etc.
  message: string;      // Message humain
}
```

### `CompareContext`
Contexte interne passé pendant la comparaison :
```typescript
interface CompareContext {
  options: CompareOptions;
  path: Path;                      // Chemin actuel dans l'arbre
  visitedActual: WeakSet<object>;  // Pour détecter les cycles
  visitedExpected: WeakSet<object>;
  depth: number;                   // Profondeur actuelle
}
```

### `CompareOptions`
Options de comparaison :
```typescript
interface CompareOptions {
  treatUndefinedAsAbsent: boolean;  // true = { a: 1 } == { a: 1, b: undefined }
  maxDepth: number;                 // Limite de profondeur (défaut: 100)
  collectAllMismatches: boolean;    // true = collecter toutes les erreurs
}
```

## Flux de comparaison

```
compare(actual, expected)
    │
    ├─ createContext()           # Initialise WeakSets, path=[], depth=0
    │
    └─ compareValues(actual, expected, context)
         │
         ├─ detectMatcher(expected)
         │   │
         │   ├─ Si matcher trouvé → dispatchToMatcherHandler()
         │   │   (any-matcher, containing-matcher, etc.)
         │   │
         │   └─ Si pas matcher mais contient des matchers imbriqués
         │       → compareObjectWithMatchers() (récursion contrôlée)
         │
         └─ Si pas de matcher → dispatchToComparator()
             │
             ├─ Vérifie références circulaires (WeakSet)
             ├─ Vérifie profondeur max
             │
             └─ Route vers le bon comparator:
                 - primitive-comparator (null, string, number, boolean, etc.)
                 - object-comparator (plain objects)
                 - array-comparator
                 - map-comparator
                 - set-comparator
```

## Détection des matchers

Les matchers mockit sont des objets avec une clé `mockit__*` :
```typescript
// anyString() crée:
{ "mockit__any": true, what: "string" }

// objectContaining({ a: 1 }) crée:
{ "mockit__isContaining": true, original: { a: 1 } }
```

La fonction `detectMatcher()` cherche ces clés et retourne un `MatcherInfo` avec le type et le payload.

## Comparaison d'objets

Le `object-comparator` fait une comparaison **stricte** :
1. Toutes les clés de `expected` doivent exister dans `actual` avec les bonnes valeurs
2. `actual` ne doit PAS avoir de clés supplémentaires (sinon = `extra_property` error)
3. Si `treatUndefinedAsAbsent: true`, les clés avec valeur `undefined` sont ignorées des deux côtés

C'est différent de `objectContaining()` qui fait du partial matching.

## Gestion des références circulaires

Utilise deux `WeakSet` :
- `visitedActual` : objets déjà visités côté actual
- `visitedExpected` : objets déjà visités côté expected

Avant de descendre dans un objet, on vérifie s'il a déjà été visité. Si oui, on considère que c'est OK (on évite la boucle infinie).

## Formatters

### structured-formatter
Génère un rapport texte chemin par chemin :
```
Found 2 mismatch(es):

1. [Value Mismatch] at user.name
   Expected "John", got "Jane"
   Expected: "John"
   Actual:   "Jane"

2. [Type Mismatch] at user.age
   Expected type "number", got "string"
```

### visual-formatter
Génère un diff visuel style git en combinant :
- `pretty-format` pour sérialiser les valeurs (avec notre plugin pour les matchers)
- `jest-diff` (`diffStringsUnified`) pour créer le diff

```
- Expected  - 1
+ Received  + 1

  Object {
-   "name": "John",
+   "name": "Jane",
    "age": 25,
  }
```

### matcher-plugin
Plugin `pretty-format` qui permet d'afficher les matchers de façon lisible dans le diff visuel.

Sans le plugin :
```
Object {
    "mockit__any": true,
    "what": "string",
}
```

Avec le plugin :
```
anyString()
```

Le plugin détecte les objets avec une clé `mockit__*` et les sérialise en appelant la fonction de formatage appropriée.

## Intégration avec verifyThat

### API simplifiée

```typescript
// Par défaut : montre les 3 closest calls avec diff
verifyThat(mock).wasCalledWith(args);

// Mode verbose : montre tous les calls sans troncature
verifyThat(mock, { verbose: true }).wasCalledWith(args);
```

### Comportement par défaut

Quand `wasCalledWith()` échoue :
1. Compare chaque call avec les arguments attendus via `compareDetailed()`
2. Trie les calls par nombre de mismatches (closest first)
3. Affiche les 3 plus proches avec leur diff structuré + visuel

### Closest Call

Quand plusieurs calls existent, on identifie le plus proche en comptant les mismatches :
```
Cherche: wasCalledWith("John", 25)
Call 1: ("Jane", 30)  → 2 mismatches
Call 2: ("John", 30)  → 1 mismatch  ← closest
Call 3: ("Bob", 42)   → 2 mismatches
```

## Exemple de message d'erreur

```
Function was not called with expected parameters.

Expected: (anyString())

Closest call(s):

--- Call 1 (1 difference(s)) ---
Arguments: (12345)

Found 1 mismatch(es):

1. [Matcher Failed] at [0]
  Expected anyString(), got 12345 (number)
  Expected: anyString()
  Actual:   12345

Visual diff:
- Expected  - 1
+ Received  + 1

  [
-   anyString(),
+   12345,
  ]
```
