# Ideas & Future Features

## Features potentielles

### 1. Ordered Verification

Vérifier que les mocks ont été appelés dans un ordre précis.

```typescript
// API à définir - celle-ci est juste un exemple
m.verifyInOrder([mock.init, mock.process, mock.cleanup]);
```

**Status**: À explorer

---

### 2. StrictMock

Un mock qui throw si appelé sans configuration préalable (au lieu de retourner `undefined`).

```typescript
const mock = m.StrictMock<Service>();
mock.getUser(1); // Throws: "No behaviour configured for getUser"

m.when(mock.getUser).isCalledWith(1).thenReturn(user);
mock.getUser(1); // OK
```

**Status**: À implémenter - entité séparée, pas une option

---

### 3. Support Generators (thenYield)

Support pour les fonctions génératrices.

```typescript
function* original() {
  yield 1;
  yield 2;
}

const mock = Mock(original);
m.when(mock).isCalled.thenYield([1, 2, 3]);
```

**Status**: Incertain - cas d'usage rare ?

---

### 4. Getters & Setters

Pouvoir mocker des getters et setters sur des objets/classes.

```typescript
class Config {
  get apiUrl(): string {
    return "...";
  }
  set apiUrl(value: string) {
    /* ... */
  }
}

const mock = Mock(Config);
m.when(mock).get("apiUrl").thenReturn("http://test.local");
m.when(mock)
  .set("apiUrl")
  .thenCall((value) => {
    /* ... */
  });
```

**Questions techniques**:

- Les getters passent dans le `get` trap du Proxy
- Les setters passent dans le `set` trap du Proxy
- Comment distinguer l'accès à une propriété mockée vs un vrai getter ?
- API à définir

**Status**: À investiguer - faisabilité technique à confirmer

---

## Documentation manquante

### 1. API Jest-style (inline)

Documenter les méthodes chaînables :

- `mockReturnValue()` / `mockReturnValueOnce()`
- `mockResolvedValue()` / `mockResolvedValueOnce()`
- `mockRejectedValue()` / `mockRejectedValueOnce()`
- `mockImplementation()` / `mockImplementationOnce()`
- `mockThrow()` / `mockThrowOnce()`
- `mockReturnThis()`
- `mockClear()` / `mockReset()` / `mockRestore()`

### 2. Pattern spread pour conserver le comportement original

Expliquer comment utiliser le spread pour faire des partial mocks avec le vrai comportement :

```typescript
import * as originalModule from "./myModule";

// Avec jest.mock ou vi.mock
jest.mock("./myModule", () => ({
  ...originalModule, // Garde tout le comportement original
  specificFunction: m.fn(), // Remplace juste cette fonction
}));

// Ensuite on peut configurer le mock
m.when(specificFunction).isCalled.thenReturn("mocked");
```

C'est simple mais apparemment pas évident pour tout le monde.

---

## Architecture

### Deux formaters pour les messages d'erreur

Pour la PR 64 (`m.expect`), il faudra un formater différent de celui de `verifyThat`.

**Contexte `verifyThat`** : Compare une expectation vs N appels

- Montre les appels les plus proches
- Message orienté "qu'est-ce qui s'est passé vs ce qu'on attendait"

```
Function was not called with expected parameters.
Expected: (1, "hello")

Closest call(s):
--- Call 1 (1 difference) ---
Arguments: (1, "world")
```

**Contexte `m.expect`** : Compare une valeur vs une expectation

- Pas de notion de "calls"
- Message orienté diff simple entre deux valeurs

```
Expected value does not match.

- Expected
+ Received

  {
    name: "John",
-   age: 30,
+   age: 31,
  }
```

**Architecture proposée** :

```
compare-v2/
├── comparators/     # Réutilisable
├── matchers/        # Réutilisable
├── result.ts        # Réutilisable (structure des mismatches)
└── formatters/
    ├── mock-calls-formatter.ts    # Pour verifyThat
    └── value-diff-formatter.ts    # Pour m.expect (version simplifiée)
```

Le moteur de comparaison est le même, seul le formatage du message final change.
