const fs = require('fs');

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("sortByFilePath", (values) => {
    return [...values].sort((a, b) => a.filePathStem.localeCompare(b.filePathStem));
  });

  eleventyConfig.addFilter("titlecase", (str) => {
    if (!str) return "";
    return str
      .replace(/[-_]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  });

  eleventyConfig.addFilter("getPathPart", (path, index) => {
    const parts = path.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
    return parts[index] || "";
  });

  eleventyConfig.addTemplateFormats("cook");
  
  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async (data) => {
        // 1. USE THE BUILT-IN DATA OBJECT
        // Eleventy has already parsed your frontmatter into the 'data' variable.
        // We just need to remove the raw text block from the body.
        const recipeBody = inputContent.replace(/^---[\s\S]*?---\n?/, '').trim();

        // 2. Format the Cooklang body
        let formatted = recipeBody
          .replace(/@([\w\s]+)\{([^%}]*)%([^}]*)\}/g, '<span class="ing"><strong>$2 $3</strong> $1</span>')
          .replace(/@([\w\s]+)\{([^}]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          .replace(/(\d+[\/\d\.]*)%([\w]+)/g, '<strong>$1 $2</strong>')
          .replace(/@([\w\s]+)/g, '<span class="ing">$1</span>')
          .replace(/#([\w\s]+)\{?([^}]*)\}?/g, '<span class="tool">$1</span>')
          .replace(/>>(.*?)\n/g, (match, note) => {
            if (match.startsWith('>>')) {
                return `<div class="note"><strong>Note:</strong> ${note.replace('>>', '').trim()}</div>`;
            }
            return match;
          })
          .replace(/\n/g, '<br>');

        // 3. Build Metadata HTML using the 'data' object directly
        let metadataHtml = '';
        if (data.author || data.category || data.source || data['cook time']) {
          metadataHtml = `
            <div class="metadata">
              ${data.author ? `<p><strong>Author:</strong> ${data.author}</p>` : ''}
              ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
              ${data['cook time'] ? `<p><strong>Cook Time:</strong> ${data['cook time']}</p>` : ''}
              ${data.source ? `<p><strong>Source:</strong> ${data.source}</p>` : ''}
            </div>
          `;
        }

        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.title}</title>
            <style>
              body { 
                font-family: 'Georgia', serif; 
                background: #fdfaf7; 
                color: #4e342e; 
                margin: 0; 
                padding: 10px; 
                line-height: 1.6; 
                display: flex;
                justify-content: center;
              }
              .container { width: 100%; max-width: 800px; }
              .recipe-card { 
                background: white; 
                padding: 25px; 
                border-radius: 12px; 
                border: 1px solid #e0d7d5; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                box-sizing: border-box;
              }
              h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; margin-top: 0; font-size: 1.8rem; padding-bottom: 10px; }
              strong { color: #5d4037; font-weight: bold; }
              .metadata { 
                background: #efebe9; 
                padding: 15px; 
                border-radius: 5px; 
                margin-bottom: 25px; 
                font-size: 0.95rem;
                border-left: 5px solid #8d6e63;
              }
              .metadata p { margin: 8px 0; }
              .metadata strong { color: #5d4037; }
              .note { background: #efebe9; padding: 15px; border-radius: 5px; font-style: italic; border-left: 5px solid #8d6e63; margin: 20px 0; font-size: 0.95rem; }
              .back { text-decoration: none; color: #8d6e63; font-weight: bold; display: inline-block; margin-bottom: 15px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
              
              @media (min-width: 600px) {
                body { padding: 40px 20px; }
                .recipe-card { padding: 40px; }
                h1 { font-size: 2.5rem; }
              }
            </style>
          </head>
          <body>
            <div class="container">
                <a href="/" class="back">← Back to Collection</a>
                <div class="recipe-card">
                    <h1>${data.title}</h1>
                    ${metadataHtml}
                    <div class="recipe-body">${formatted}</div>
                </div>
            </div>
          </body>
          </html>
        `;
      };
    }
  });

  return {
    dir: {
      input: "recipes",
      output: "_site"
    }
  };
};
