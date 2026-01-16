# Ideas & Future Features

## Features potentielles

### 1. Ordered Verification

Vérifier que les mocks ont été appelés dans un ordre précis.

```typescript
// API à définir - celle-ci est juste un exemple
m.verifyInOrder([
  mock.init,
  mock.process,
  mock.cleanup
]);
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
function* original() { yield 1; yield 2; }

const mock = Mock(original);
m.when(mock).isCalled.thenYield([1, 2, 3]);
```

**Status**: Incertain - cas d'usage rare ?

---

### 4. Getters & Setters

Pouvoir mocker des getters et setters sur des objets/classes.

```typescript
class Config {
  get apiUrl(): string { return "..."; }
  set apiUrl(value: string) { /* ... */ }
}

const mock = Mock(Config);
m.when(mock).get("apiUrl").thenReturn("http://test.local");
m.when(mock).set("apiUrl").thenCall((value) => { /* ... */ });
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
  ...originalModule,                    // Garde tout le comportement original
  specificFunction: m.fn()              // Remplace juste cette fonction
}));

// Ensuite on peut configurer le mock
m.when(specificFunction).isCalled.thenReturn("mocked");
```

C'est simple mais apparemment pas évident pour tout le monde.
