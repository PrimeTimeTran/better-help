# Better Help

A collection of small formatting commands focused on one thing:

**making JSX and CSS easier to read.**

## Values

- sort lines
- structural readability
- JSX density reduction
- foldability
- visual parsing speed
- component cognition

### More than

- inline styling flexibility

---

# Commands

## Create Single-Line JSX classNames

### Command Palette

```txt
Ctrl + Shift + P
Better Help: Create single lines out of multi line JSX classNames
```

### Purpose

Converts multi-line JSX className values into a normalized single-line format.

### Before

```tsx
<Button
  className="
    flex
    items-center
    justify-between
    gap-2
  "
>
```

### After

```tsx
<Button className="flex items-center justify-between gap-2">
```

### Why

- easier scanning
- less vertical space
- more code visible on screen
- simpler diffs

---

## Clean JSX Class Names

### Command Palette

```txt
Ctrl + Shift + P
Better Help: Clean JSX class name warnings, and normalize them to one line
```

### Purpose

Removes class name formatting issues and normalizes output into a consistent single-line style.

### Before

```tsx
<div
  className="
    flex
    flex
    items-center
  "
>
```

### After

```tsx
<div className="flex items-center">
```

### Why

- cleaner diffs
- fewer lint warnings
- consistent formatting

---

## Right Align Trailing Comments

### Command Palette

```txt
Ctrl + Shift + P
Better Help: Right Align Trailing comments.
```

### Purpose

Aligns trailing comments into a consistent visual column.

### Before

```ts
const width = 100 // width
const height = 2000 // height
const x = 5 // x
```

### After

```ts
const width = 100 // width
const height = 2000 // height
const x = 5 // x
```

### Why

- faster visual scanning
- easier comparison
- cleaner documentation blocks

---

## Align CSS Banner Comments

### Command Palette

```txt
Ctrl + Shift + P
Better Help: Align Trailing Comments in CSS
```

### Purpose

Formats CSS section banners and comment blocks into a consistent style.

### Before

```css
/* Button */
/* Layout */
/* Header */
```

### After

```css
/* ==================== Button ==================== */
/* ==================== Layout ==================== */
/* ==================== Header ==================== */
```

### Why

- easier file navigation
- better code folding landmarks
- clearer visual structure

---

# Philosophy

Most tooling focuses on:

- generating code
- reducing keystrokes
- increasing flexibility

Better Help focuses on:

- reducing cognitive load
- improving scalability
- creating stronger visual structure
- helping developers understand code faster

The goal is not fewer characters.

The goal is fewer decisions while reading.
