module.exports = function(eleventyConfig) {
  // Sort by file path to keep sections and sub-sections together
  eleventyConfig.addFilter("sortByFilePath", (values) => {
    return [...values].sort((a, b) => a.filePathStem.localeCompare(b.filePathStem));
  });

  // Extract folder names for the navigation
  eleventyConfig.addFilter("getPathPart", (path, index) => {
    const parts = path.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
    return parts[index] || "";
  });

  eleventyConfig.addTemplateFormats("cook");
  
  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async (data) => {
        // Strip the YAML front matter from the recipe body for display
        const recipeBody = inputContent.replace(/^---[\s\S]*?---\n?/, '').trim();

        // Basic Cooklang Syntax Highlighting/Formatting
        let formatted = recipeBody
          .replace(/>>(.*?)\n/g, '<div class="note"><strong>Note:</strong> $1</div>')
          .replace(/@([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          .replace(/#([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="tool">$1</span>')
          .replace(/\n/g, '<br>');

        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${data.title}</title>
            <style>
              body { font-family: 'Georgia', serif; background: #fdfaf7; color: #4e342e; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; }
              .recipe-card { background: white; padding: 30px; border-radius: 8px; border: 1px solid #e0d7d5; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
              h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; margin-bottom: 5px; }
              .meta { color: #8d6e63; font-style: italic; margin-bottom: 25px; font-size: 0.9em; }
              .ing { background: #fff; border: 1px solid #d7ccc8; padding: 2px 6px; border-radius: 4px; margin: 2px; display: inline-block; }
              .back { text-decoration: none; color: #8d6e63; font-weight: bold; }
            </style>
          </head>
          <body>
            <a href="/" class="back">← Home</a>
            <div class="recipe-card">
                <h1>${data.title}</h1>
                <div class="meta">By ${data.author || 'Mildred'} | Category: ${data.category}</div>
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
