const fs = require('fs');

module.exports = function(eleventyConfig) {
  // 1. Sort recipes alphabetically by their file path
  eleventyConfig.addFilter("sortByFilePath", (values) => {
    return [...values].sort((a, b) => a.filePathStem.localeCompare(b.filePathStem));
  });

  // 2. Custom Title Case filter for Sections/Sub-sections (e.g., meat_poultry -> Meat Poultry)
  eleventyConfig.addFilter("titlecase", (str) => {
    if (!str) return "";
    return str
      .replace(/[-_]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  });

  // 3. Extract folder parts for the nested navigation (0 = Section, 1 = Sub-section)
  eleventyConfig.addFilter("getPathPart", (path, index) => {
    const parts = path.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
    return parts[index] || "";
  });

  // 4. Register the .cook extension
  eleventyConfig.addTemplateFormats("cook");
  
  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async (data) => {
        // Extract YAML frontmatter
        const frontmatterMatch = inputContent.match(/^---\n([\s\S]*?)\n---/);
        let metadata = {};
        
        if (frontmatterMatch) {
          const frontmatterContent = frontmatterMatch[1];
          // Parse YAML frontmatter (simple key: value parsing)
          const lines = frontmatterContent.split('\n');
          lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              metadata[key.trim()] = valueParts.join(':').trim();
            }
          });
        }

        // Remove the YAML frontmatter from the display content
        const recipeBody = inputContent.replace(/^---[\s\S]*?---\n?/, '').trim();

        // Transform Cooklang symbols into clean HTML
        let formatted = recipeBody
          // Handle @ingredient{quantity%unit} -> "quantity unit ingredient"
          .replace(/@([\w\s]+)\{([^%}]*)%([^}]*)\}/g, '<span class="ing"><strong>$2 $3</strong> $1</span>')
          
          // Handle @ingredient{quantity} -> "quantity ingredient"
          .replace(/@([\w\s]+)\{([^}]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          
          // Handle shorthand quantity%unit (e.g., 1%Tbsp) -> "1 Tbsp"
          .replace(/(\d+[\/\d\.]*)%([\w]+)/g, '<strong>$1 $2</strong>')
          
          // Clean up remaining @ symbols
          .replace(/@([\w\s]+)/g, '<span class="ing">$1</span>')
          
          // Handle Cookware #pot{...}
          .replace(/#([\w\s]+)\{?([^}]*)\}?/g, '<span class="tool">$1</span>')
          
          // Metadata and Notes (starts with >>)
          .replace(/>?(.*?)\n/g, (match, note) => {
            if (match.startsWith('>>')) {
                return `<div class="note"><strong>Note:</strong> ${note.replace('>>', '').trim()}</div>`;
            }
            return match;
          })
          
          // Convert single newlines to <br> for instructions
          .replace(/\n/g, '<br>');

        // Return the full HTML for the recipe page
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
              .tool { color: #795548; font-style: italic; }
              
              /* Desktop Adjustments */
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
                    ${metadata.author ? `
                    <div class="metadata">
                      ${metadata.author ? `<p><strong>Author:</strong> ${metadata.author}</p>` : ''}
                      ${metadata.category ? `<p><strong>Category:</strong> ${metadata.category}</p>` : ''}
                      ${metadata['cook time'] ? `<p><strong>Cook Time:</strong> ${metadata['cook time']}</p>` : ''}
                      ${metadata.source ? `<p><strong>Source:</strong> ${metadata.source}</p>` : ''}
                    </div>
                    ` : ''}
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
