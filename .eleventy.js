module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("sortByFilePath", (values) => {
    return [...values].sort((a, b) => a.filePathStem.localeCompare(b.filePathStem));
  });

  eleventyConfig.addFilter("getPathPart", (path, index) => {
    const parts = path.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
    return parts[index] || "";
  });

  eleventyConfig.addTemplateFormats("cook");
  eleventyConfig.addExtension("cook", {
    read: true, 
    getData: async (inputPath) => {
      const content = require('fs').readFileSync(inputPath, 'utf-8');
      // Updated regex to capture the exact string after "title:"
      const titleMatch = content.match(/^>>\s*title:\s*(.*)$/m);
      return {
        title: titleMatch ? titleMatch[1].trim() : null 
      };
    },
    compile: async (inputContent) => {
      return async (data) => {
        let formatted = inputContent
          .replace(/>>(.*?)\n/g, '<div class="note"><strong>Note:</strong> $1</div>')
          .replace(/@([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          .replace(/#([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="tool">$1</span>')
          .replace(/\n/g, '<br>');

        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${data.title || data.page.fileSlug}</title>
            <style>
              body { font-family: 'Georgia', serif; background: #fdfaf7; color: #4e342e; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; }
              .recipe-card { background: white; padding: 30px; border-radius: 8px; border: 1px solid #e0d7d5; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
              h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; }
              .ing { background: #fff; border: 1px solid #d7ccc8; padding: 2px 6px; border-radius: 4px; margin: 2px; display: inline-block; font-size: 0.9em; }
              .note { background: #efebe9; padding: 15px; border-radius: 5px; font-style: italic; border-left: 5px solid #8d6e63; margin: 20px 0; }
              .back { text-decoration: none; color: #8d6e63; font-weight: bold; }
            </style>
          </head>
          <body>
            <a href="/" class="back">← Home</a>
            <div class="recipe-card">
                <h1>${data.title || data.page.fileSlug.replace(/[-_]/g, ' ')}</h1>
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
