# Mockit - API inline pour configurer les mocks

## Probleme

Aujourd'hui :
```ts
m.when(someMock.fn).isCalled.thenReturn(value)
```

Souhaite : une syntaxe plus concise pour les cas simples.

---

## Approche 1 : Methodes sur le mock (style Jest)

```ts
fn.mockReturnValue(42)
fn.mockResolvedValue(data)
fn.mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(99)
```

**Piste d'implementation :**
- Type intersection : `MockedFunction<T> = T & { mockReturnValue(...): ... }`
- Ajouter handlers dans le `get` trap du Proxy
- Queue FIFO pour les "once"

**+** Familier, chainable, concis
**-** Collision possible avec proprietes de la fonction originale

---

## Approche 2 : Namespace `.mock`

```ts
fn.mock.returnValue(42)
fn.mock.resolvedValue(data)
fn.mock.calls  // historique
```

**Piste d'implementation :**
- Objet `MockController` cree dans `mockFunction()`
- Expose via `get` trap quand `prop === "mock"`

**+** Zero collision, namespace explicite
**-** Moins familier, plus verbeux

---

## Approche 3 : Fonctions helper standalone

```ts
import { returns, resolves, returnsOnce } from 'mockit'

returns(fn, 42)
resolves(fn, data)
```

**Piste d'implementation :**
- Nouveau fichier `src/behaviours/inline.ts`
- Utilise `Reflect.set()` comme `when()` le fait deja

**+** Zero modif du Proxy, tree-shakeable, typage complet grace aux generiques
**-** Pas chainable, pas de decouverte via `mock.` (il faut connaitre et importer les helpers)

---

## Approche 4 : Config a la creation

```ts
const fn = Mock(someFunction, { returns: 42 })
const fn2 = Mock(someFunction, { resolves: data })
```

**Piste d'implementation :**
- Etendre signature de `Mock()` avec options
- Convertir en `defaultBehaviour`

**+** Ultra-concis pour setup initial
**-** Pas de "once", moins flexible

---

## Approche 5 : Combinaison

Mixer plusieurs approches selon le cas d'usage :

```ts
// Simple
const fn = Mock(someFunc, { returns: 42 })

// Sequence
fn.mockReturnValueOnce(1).mockReturnValueOnce(2)

// Conditionnel (existant)
m.when(fn).isCalledWith(x).thenReturn(y)
```

---

## Approche 4/5 pour objets (classes, interfaces)

`Mock()` accepte des fonctions mais aussi des classes/interfaces. La config inline doit s'adapter :

### Syntaxe envisagee

```ts
// Fonction : valeur directe
const fn = Mock(someFunc, { returns: 42 })

// Classe/Interface : config par methode
const mock = Mock<UserService>({
  getUser: { returns: userData },
  save: { resolves: true },
  delete: { throws: new Error('forbidden') }
})

// Classe avec reference + config
const mock = Mock(UserService, {
  getUser: { returns: userData }
})
```

### Implementation avec overloads

```ts
// Declarations (ce que voit l'utilisateur)
function Mock<T extends (...args: any[]) => any>(fn: T): MockedFunction<T>
function Mock<T extends (...args: any[]) => any>(fn: T, opts: FnOptions<T>): MockedFunction<T>
function Mock<T>(config: ObjectConfig<T>): MockedObject<T>
function Mock<T>(classRef: Class<T>, config?: ObjectConfig<T>): MockedObject<T>
function Mock<T>(): MockedObject<T>

// Implementation unique
function Mock<T>(_param?: any, _opts?: any): any {
  // Logique de routing selon le type des arguments
}
```

### Types helper

```ts
type FnOptions<T extends (...args: any[]) => any> = {
  returns?: ReturnType<T>
  resolves?: Awaited<ReturnType<T>>
  rejects?: unknown
  throws?: unknown
}

type ObjectConfig<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? FnOptions<T[K]>
    : never
}
```

TypeScript choisit automatiquement le bon overload selon les arguments passes.

---

## Question cle : typage

Pour que `MockedFunction<T>` reste compatible avec `T` :

```ts
type MockedFunction<T extends (...args: any[]) => any> = T & {
  mockReturnValue(value: ReturnType<T>): MockedFunction<T>
  // ...
}
```

L'intersection `T & {...}` garantit que le mock est assignable partout ou `T` est attendu.

---

## Question cle : collisions

Si la fonction mockee a deja une propriete `mockReturnValue` :

- **Option A** : Ecraser (comme Jest fait)
- **Option B** : Utiliser namespace `.mock` (approche 2)
- **Option C** : Prefixe (`$return`, `_return`, etc.)
