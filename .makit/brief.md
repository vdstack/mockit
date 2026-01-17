# Brief : Site officiel mockit.org

## L'idee en une phrase

Site vitrine et documentation pour mockit, une librairie TypeScript de mocking, avec un playground interactif innovant.

## Contexte

mockit est une librairie de mocking TypeScript qui a besoin d'une presence web pour :
- Gagner en credibilite face aux alternatives etablies (jest.mock, vitest, sinon)
- Faciliter l'adoption par de nouveaux utilisateurs
- Centraliser la documentation (le README GitHub ne suffit plus)
- Se differencier clairement des concurrents
- Ameliorer le referencement SEO pour etre decouvert organiquement

## Objectifs

- Lancer un site vitrine professionnel sur mockit.org
- Fournir une documentation complete et navigable (guides, API, exemples)
- Proposer un playground interactif distinctif (setup a gauche, execution a droite)
- Creer une page de comparaison avec les alternatives
- Optimiser le SEO pour apparaitre sur les recherches "typescript mocking library"

## Utilisateurs cibles

| Profil | Besoin |
|--------|--------|
| Developpeurs TypeScript | Decouvrir mockit, comprendre comment l'utiliser |
| Tech leads / Architectes | Evaluer mockit pour leur equipe, comparer aux alternatives |
| Contributeurs potentiels | Comprendre le projet, comment contribuer |

## Contenu du site

### Essentiel (MVP)

1. **Landing page**
   - Pitch et value proposition claire
   - Code examples percutants
   - Call-to-action vers la doc et le playground

2. **Documentation**
   - Getting started
   - Guides par use case
   - API reference complete
   - Exemples de code

3. **Playground interactif**
   - Layout split : setup a gauche, execution a droite
   - Plus riche qu'un simple TypeScript playground
   - Montre le comportement des mocks en temps reel

4. **Page de comparaison**
   - mockit vs jest.mock
   - mockit vs vitest
   - mockit vs sinon
   - Tableau de features et differences d'approche

### Nice-to-have (v2)

- Changelog / Releases
- Version avancee du playground (scenarios pre-definis, partage de snippets)
- Blog / Articles techniques
- Guide de contribution detaille

## Stack technique

| Aspect | Choix |
|--------|-------|
| Framework | Astro (SSG, excellent pour SEO) |
| Design | Dark mode only, minimaliste avec palette coloree distinctive |
| Hebergement | GitHub Pages (gratuit, prod-ready) ou Vercel/Cloudflare Pages |
| Domaine | mockit.org |
| Playground | Monaco Editor + execution custom (a definir) |

## Contraintes connues

- **SEO prioritaire** : structure semantique, meta tags, structured data, sitemap
- **Static first** : Astro SSG pour des pages pre-rendues et rapides
- **Maintenance legere** : le site doit etre facile a maintenir en parallele de la lib
- **Coherence visuelle** : s'inspirer des sites de reference (Linear, Raycast, Tailwind, Zod, Prisma)

## Inspirations identifiees

- **Raycast** : landing page impactante, animations subtiles
- **Linear** : minimalisme, dark mode elegant
- **Tailwind CSS** : documentation exemplaire, recherche rapide
- **Zod** : site de lib TypeScript, bon equilibre simplicite/info
- **Prisma** : playground interactif, documentation riche

## Questions ouvertes

- Quelle techno pour l'execution dans le playground ? (WebContainers, iframe sandbox, autre)
- Faut-il un systeme de recherche dans la doc ? (Algolia DocSearch, Pagefind, autre)
- Le site sera-t-il dans le meme repo que mockit ou un repo separe ?
- Quelle palette de couleurs pour l'identite visuelle ?

---

*Genere par Brainstormer le 2026-01-17*
*Technique utilisee : Starbursting*
