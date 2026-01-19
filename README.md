# Loving Memories of Mildred

A collection of cherished family recipes in honor of my grandmother Mildred McKinzie, now preserved in [Cooklang](https://cooklang.org/) format and built with [Eleventy](https://www.11ty.dev/).

## Overview

This project digitizes and organizes family recipes from "Loving Memories of Mildred," a cookbook compiled by my family. The recipes are organized by collection and category, making them easy to browse and reference.

## Recipe Collections

- **Grandma's Misc Goodies** - Appetizers, drinks, pickles/jams, and sauces
- **Great Grandma's Soup and Salad Bar** - Soups and salads
- **Millie's Meat and Potatoes Favorites** - Meat, poultry, fish, and vegetable dishes
- **Miss Charlotte's Sweet Dreams** - Candy, cookies, desserts, and frostings
- **Mom's Bread and Breakfast** - Breads and breakfast items
- **Tootsie's Roles** - Casseroles and other specialties

## Getting Started

### Prerequisites
- Node.js and npm

### Installation

```bash
npm install
```

### Building

```bash
npm run build
```

This will generate a static site in the `public` directory using Eleventy.

## File Formats

Recipes are available in multiple formats:
- **Cooklang (.cook)** - Primary format for structured recipes
- **RecipeMD (.recipemd)** - Alternative markdown-based format
- **Text (.txt)** - Simple text listing of recipes

## Project Structure

```
recipes/
├── index.njk                           # Main template
└── [collection]/
    └── [category]/
        └── [recipe-name].cook
```

## License

These recipes are preserved as a family archive.

