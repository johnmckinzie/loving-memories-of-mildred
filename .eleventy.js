const fs = require('fs');

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("sortByFilePath", (values) => {
    return [...values].sort((a, b) => a.filePathStem.localeCompare(b.filePathStem));
  });

  eleventyConfig.addFilter("titlecase", (str) => {
    if (!str) return "";
    return str.replace(/[-_]/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  });

  eleventyConfig.addFilter("getPathPart", (path, index) => {
    const parts = path.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
    return parts[index] || "";
  });

  eleventyConfig.addTemplateFormats("cook");
  
  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async (data) => {
        // Strip Frontmatter
        const recipeBody = inputContent.replace(/^---[\s\S]*?---\n?/, '').trim();

        let formatted = recipeBody
          // 1. Handle @ingredient{quantity%unit} -> "quantity unit ingredient"
          .replace(/@([\w\s]+)\{([^%}]*)%([^}]*)\}/g, '<span class="ing"><strong>$2 $3</strong> $1</span>')
          
          // 2. Handle @ingredient{quantity} -> "quantity ingredient"
          .replace(/@([\w\s]+)\{([^}]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          
          // 3. Handle shorthand quantity%unit (e.g., 1%Tbsp) -> "1 Tbsp"
          .replace(/(\d+[\/\d\.]*)%([\w]+)/g, '<strong>$1 $2</strong>')
          
          // 4. Clean up remaining @ symbols
          .replace(/@([\w\s]+)/g, '<span class="ing">$1</span>')
          
          // 5. Handle Cookware #pot{...}
          .replace(/#([\w\s]+)\{?([^}]*)\}?/g, '<span class="tool">$1</span>')
          
          // 6. Metadata and Notes
          .replace(/>>(.*?)\n/g, '<div class="note"><strong>Note:</strong> $1</div>')
          
          // 7. Line breaks for instructions
          .replace(/\n/g, '<br>');

        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${data.title}</title>
            <style>
              body { font-family: 'Georgia', serif; background: #fdfaf7; color: #4e342e; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; }
              .recipe-card { background: white; padding: 40px; border-radius: 12px; border: 1px solid #e0d7d5; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; margin-top: 0; }
              strong { color: #5d4037; font-weight: 700; }
              .ing { display: inline-block; margin-bottom: 2px; }
              .note { background: #efebe9; padding: 15px; border-radius: 5px; font-style: italic; border-left: 5px solid #8d6e63; margin: 20px 0; }
              .back { text-decoration: none; color: #8d6e63; font-weight: bold; display: block; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <a href="/" class="back">← HOME</a>
            <div class="recipe-card">
                <h1>${data.title}</h1>
                <div class="recipe-body">${formatted}</div>
            </div>
          </body>
          </html>
        `;
      };
    }
  });

  return { dir: { input: "recipes", output: "_site" } };
};
