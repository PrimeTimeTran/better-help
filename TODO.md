# Goal

### Generation

Generate Type
Generate Props
Generate Return Type

### Promotion

Extract To File
Extract To Feature
Move Type
Move Component

### Detection

Find Similar Types
Find Duplicate Types
Find Unused Types

###

## Component extract lifecycle...

| Phase | Task                           | What it does                                                 | Why it matters                                         |
| ----- | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| 1     | Extract to Constant            | Moves selected expression into a local constant              | Reduces duplication and gives intent a name            |
| 2     | Extract to Function            | Converts selected code into a reusable function              | Introduces reuse without creating component boundaries |
| 3     | Extract to Inner Component     | Creates a React component in the same file                   | Useful when JSX grows beyond a reasonable size         |
| 4     | Extract to File Component      | Creates a new component file and imports it                  | Establishes ownership and separation of concerns       |
| 5     | Extract to Shared Component    | Moves JSX into a framework-aware shared location             | Encourages reuse across routes/pages/features          |
| 6     | Generate Props Type            | Infers component props from usage                            | Eliminates manual typing boilerplate                   |
| 7     | Generate Return Type           | Infers return type from implementation                       | Makes APIs explicit and safer                          |
| 8     | Generate Missing Types         | Walks file and adds inferred type annotations                | Helps migrate JS-ish TS into strict TS                 |
| 9     | Generate Interface From Object | Creates reusable interface/type from object shape            | Useful when data structures stabilize                  |
| 10    | Inline Component               | Reverses extraction and collapses component back into parent | Helpful when abstractions become unnecessary           |
| 11    | Convert Function → Component   | Wraps render helpers into proper React components            | Enables DevTools visibility and React features         |
| 12    | Convert Component → Function   | Removes component overhead when reuse isn't needed           | Simplifies architecture                                |
| 13    | Memoize Component              | Wraps component in memo and fixes typing                     | Performance optimization with minimal effort           |
| 14    | Promote Local Type             | Moves local type/interface into shared module                | Encourages reuse and consistency                       |
| 15    | Generate Barrel Export         | Updates index.ts automatically                               | Reduces manual export maintenance                      |
| 16    | Move Component                 | Relocates component and updates imports                      | Supports evolving folder structures                    |
| 17    | Split Large Component          | Detects extraction opportunities automatically               | Helps manage growing files                             |
| 18    | Merge Components               | Combines tightly coupled components                          | Reduces unnecessary fragmentation                      |
| 19    | Generate Story                 | Creates Storybook story from component signature             | Speeds up documentation and testing                    |
| 20    | Generate Test Skeleton         | Creates test file from component API                         | Reduces setup friction                                 |

## Code → Diagnostic Representation

| Command                  | Output                              |
| ------------------------ | ----------------------------------- |
| Copy Structure           | Elements only                       |
| Copy Structure + Classes | Elements + className                |
| Copy Structure + Styles  | Elements + style objects            |
| Copy Layout Skeleton     | Only layout-related classes         |
| Copy DOM Shape           | HTML-like tree                      |
| Copy React Tree          | JSX tree preserving component names |
| Copy Accessibility Tree  | Roles, labels, aria attrs           |
| Copy Tailwind Layout     | Only flex/grid/spacing classes      |

## Lifecycle of refactoring...

| Command               | Purpose                      |
| --------------------- | ---------------------------- |
| Extract Component     | Promote JSX                  |
| Extract Function      | Promote logic                |
| Extract Type          | Promote type                 |
| Extract Types To File | Promote related types        |
| Extract Feature       | Promote related files        |
| Extract Package       | Promote feature into package |
