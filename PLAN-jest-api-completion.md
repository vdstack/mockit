# Plan: Implémentation des fonctionnalités Jest manquantes

## Vue d'ensemble

Ce plan couvre l'implémentation des fonctionnalités Jest Mock Function API manquantes dans mockit, en excluant `mock.contexts` et `mock.instances`.

---

## Fonctionnalités à implémenter

### 1. `mockReturnThis()`

**Description Jest:**
Raccourci pour `mockImplementation(function() { return this; })`. Permet à une fonction mockée de retourner son contexte `this`, utile pour les APIs fluent/builder pattern.

**Exemple d'usage:**
```ts
const myObj = {
  name: 'Example',
  getName: jest.fn().mockReturnThis()
};
myObj.getName().getName().getName(); // chainage possible
```

**Implémentation:**
- Fichier: `src/mocks/mockFunction.ts`
- Ajouter dans le handler `get` du proxy:
```ts
if (prop === "mockReturnThis") {
  return () => {
    defaultBehaviour = {
      kind: Behaviours.Custom,
      customBehaviour: function() { return this; }
    };
    return proxy;
  };
}
```
- Fichier: `src/types/inline-api.types.ts` - Ajouter le type dans `MockFunctionMethods`

---

### 2. `mock.results`

**Description Jest:**
Tableau contenant les résultats de tous les appels. Chaque entrée a:
- `type`: `'return'` | `'throw'` | `'incomplete'`
- `value`: la valeur retournée ou l'erreur levée

**Exemple d'usage:**
```ts
const mock = jest.fn()
  .mockReturnValueOnce(1)
  .mockImplementationOnce(() => { throw new Error('oops'); })
  .mockReturnValue(42);

mock(); // 1
try { mock(); } catch(e) {} // throw
mock(); // 42

mock.mock.results;
// [
//   { type: 'return', value: 1 },
//   { type: 'throw', value: Error('oops') },
//   { type: 'return', value: 42 }
// ]
```

**Implémentation:**
- Fichier: `src/mocks/mockFunction.ts`
- Ajouter un tableau `results: MockResult[]` en parallèle de `calls`
- Dans le handler `apply`, wrapper l'exécution dans un try/catch pour capturer le résultat
- Exposer via le handler `get`

**Type à ajouter:**
```ts
type MockResult<T> =
  | { type: 'return'; value: T }
  | { type: 'throw'; value: any };
```

---

### 3. `mock.lastCall`

**Description Jest:**
Raccourci pour accéder aux arguments du dernier appel. Retourne `undefined` si jamais appelé.

**Exemple d'usage:**
```ts
const mock = jest.fn();
mock(1, 'a');
mock(2, 'b');
mock.mock.lastCall; // [2, 'b']
```

**Implémentation:**
- Fichier: `src/mocks/mockFunction.ts`
- Ajouter dans le handler `get`:
```ts
if (prop === "lastCall") {
  return calls.length > 0 ? calls[calls.length - 1].args : undefined;
}
```
- Fichier: `src/types/inline-api.types.ts` - Ajouter le type

---

### 4. `mockName(name)` / `getMockName()`

**Description Jest:**
Permet de nommer un mock pour améliorer les messages d'erreur et le debugging. Par défaut Jest affiche `'jest.fn()'`, avec `mockName()` on peut avoir un nom personnalisé.

**Exemple d'usage:**
```ts
const mock = jest.fn().mockName('fetchUser');
mock.getMockName(); // 'fetchUser'
// Dans les erreurs: "fetchUser was called with..."
```

**Implémentation:**
- Fichier: `src/mocks/mockFunction.ts`
- Ajouter une variable `let mockName = 'mockit.fn()'`
- Handler `get` pour `getMockName` retourne la valeur
- Handler `get` pour `mockName` retourne une fonction qui set et retourne proxy

---

### 5. `withImplementation(fn, callback)`

**Description Jest:**
Remplace temporairement l'implémentation pendant l'exécution du callback, puis restaure l'implémentation précédente. Supporte les callbacks async.

**Exemple d'usage:**
```ts
const mock = jest.fn().mockReturnValue('default');

mock.withImplementation(
  () => 'temporary',
  () => {
    console.log(mock()); // 'temporary'
  }
);

console.log(mock()); // 'default' (restauré)

// Version async
await mock.withImplementation(
  () => 'temp',
  async () => {
    await someAsyncOperation();
    console.log(mock()); // 'temp'
  }
);
```

**Implémentation:**
- Fichier: `src/mocks/mockFunction.ts`
- Ajouter dans le handler `get`:
```ts
if (prop === "withImplementation") {
  return (fn: Function, callback: () => any) => {
    const previousBehaviour = defaultBehaviour;
    defaultBehaviour = { kind: Behaviours.Custom, customBehaviour: fn };

    const result = callback();

    // Support async
    if (result instanceof Promise) {
      return result.finally(() => {
        defaultBehaviour = previousBehaviour;
      });
    }

    defaultBehaviour = previousBehaviour;
    return result;
  };
}
```

---

### 6. `mockRestore()`

**Description Jest:**
Fait tout ce que `mockReset()` fait, plus restaure l'implémentation originale (non-mockée). Ne fonctionne qu'avec `jest.spyOn()`.

**Exemple d'usage:**
```ts
const obj = { method: () => 'real' };
const spy = jest.spyOn(obj, 'method').mockReturnValue('mocked');

obj.method(); // 'mocked'
spy.mockRestore();
obj.method(); // 'real'
```

**Note importante:**
Cette fonctionnalité nécessite de stocker une référence à l'implémentation originale. Dans le contexte de mockit, cela ne s'applique que si on mock une vraie fonction (pas `fn()`).

**Implémentation:**
- Fichier: `src/mocks/mockFunction.ts`
- Conserver `originalImplementation` dans la closure
- Handler `get` pour `mockRestore`:
```ts
if (prop === "mockRestore") {
  return () => {
    calls.length = 0;
    onceBehaviours.length = 0;
    customBehaviours.length = 0;
    defaultBehaviour = { kind: Behaviours.Preserve }; // appelle l'original
    return proxy;
  };
}
```

---

## Fichiers à modifier

| Fichier | Modifications |
|---------|---------------|
| `src/mocks/mockFunction.ts` | Logique principale des nouvelles méthodes |
| `src/types/inline-api.types.ts` | Types pour les nouvelles méthodes |
| `src/types.ts` | Type `MockResult` si nécessaire |

## Nouveaux fichiers de test

| Fichier | Contenu |
|---------|---------|
| `src/__tests__/inline-api/mock-results.spec.ts` | Tests pour `results` et `lastCall` |
| `src/__tests__/inline-api/mock-naming.spec.ts` | Tests pour `mockName`/`getMockName` |
| `src/__tests__/inline-api/mock-restore.spec.ts` | Tests pour `mockRestore` et `withImplementation` |

---

## Ordre d'implémentation recommandé

1. **`mockReturnThis()`** - Simple, aucune dépendance
2. **`lastCall`** - Simple, aucune dépendance
3. **`mockName()` / `getMockName()`** - Simple, aucune dépendance
4. **`mock.results`** - Modifie le flow d'exécution (try/catch)
5. **`withImplementation()`** - Dépend du pattern de sauvegarde/restauration
6. **`mockRestore()`** - Dépend de la conservation de l'original

---

## Estimation de complexité

| Feature | Complexité | Lignes estimées |
|---------|------------|-----------------|
| `mockReturnThis()` | Faible | ~10 |
| `lastCall` | Faible | ~5 |
| `mockName()`/`getMockName()` | Faible | ~15 |
| `mock.results` | Moyenne | ~30 |
| `withImplementation()` | Moyenne | ~20 |
| `mockRestore()` | Faible | ~15 |
