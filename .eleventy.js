const fs = require('fs');

module.exports = function(eleventyConfig) {
  // 1. Sort recipes alphabetically by their file path
  eleventyConfig.addFilter("sortByFilePath", (values) => {
    return [...values].sort((a, b) => a.filePathStem.localeCompare(b.filePathStem));
  });

  // 2. Custom Title Case filter for Sections/Sub-sections
  eleventyConfig.addFilter("titlecase", (str) => {
    if (!str) return "";
    return str
      .replace(/[-_]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  });

  // 3. Extract folder parts for the nested navigation
  eleventyConfig.addFilter("getPathPart", (path, index) => {
    const parts = path.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
    return parts[index] || "";
  });

  // 4. Register the .cook extension
  eleventyConfig.addTemplateFormats("cook");
  
  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async (data) => {
        // Remove the YAML frontmatter block for processing the body
        const recipeBody = inputContent.replace(/^---[\s\S]*?---\n?/, '').trim();

        // Transform Cooklang symbols into clean HTML
        let formatted = recipeBody
          // A. Sections: == Section Name == (Multiline flag 'm' is key here)
          .replace(/^==+\s*(.*?)\s*==+/gm, '<h3 class="recipe-section">$1</h3>')

          // B. Ingredients with units: @ingredient{quantity%unit}
          .replace(/@([\w\s]+)\{([^%}]*)%([^}]*)\}/g, '<span class="ing"><strong>$2 $3</strong> $1</span>')
          
          // C. Ingredients without units: @ingredient{quantity}
          .replace(/@([\w\s]+)\{([^}]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          
          // D. Shorthand quantities: 1%Tbsp
          .replace(/(\d+[\/\d\.]*)%([\w]+)/g, '<strong>$1 $2</strong>')
          
          // E. Plain ingredients: @Salt
          .replace(/@([\w\s]+)/g, '<span class="ing">$1</span>')
          
          // F. Cookware: #pot{...}
          .replace(/#([\w\s]+)\{?([^}]*)\}?/g, '<span class="tool">$1</span>')
          
          // G. Notes and Metadata lines: >> This is a note
          .replace(/^>>\s*(.*?)$/gm, '<div class="note"><strong>Note:</strong> $1</div>')
          
          // H. Line breaks
          .replace(/\n/g, '<br>');

        // Build Metadata Header
        let metadataHtml = '';
        // Extract category and subcategory from file path
        const pathParts = data.filePathStem.split('/').filter(p => p && p !== 'recipes' && p !== 'index');
        const majorCategory = pathParts[0] ? pathParts[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
        const subCategory = pathParts[1] ? pathParts[1].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
        const categoryDisplay = subCategory ? `${majorCategory} - ${subCategory}` : majorCategory;
        
        if (data.author || categoryDisplay || data['cook time']) {
          metadataHtml = `
            <div class="metadata">
              ${data.author ? `<p><strong>Author:</strong> ${data.author}</p>` : ''}
              ${categoryDisplay ? `<p><strong>Category:</strong> ${categoryDisplay}</p>` : ''}
              ${data['cook time'] ? `<p><strong>Cook Time:</strong> ${data['cook time']}</p>` : ''}
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
              
              /* Section Styles */
              .recipe-section {
                color: #8d6e63;
                font-size: 1.3rem;
                margin-top: 30px;
                margin-bottom: 10px;
                border-bottom: 1px solid #efebe9;
                text-transform: uppercase;
                letter-spacing: 1px;
                display: block;
              }

              .metadata { 
                background: #efebe9; 
                padding: 15px; 
                border-radius: 5px; 
                margin-bottom: 25px; 
                font-size: 0.95rem;
                border-left: 5px solid #8d6e63;
              }
              .metadata p { margin: 5px 0; }
              
              strong { color: #5d4037; }
              .note { background: #efebe9; padding: 15px; border-radius: 5px; font-style: italic; border-left: 5px solid #8d6e63; margin: 20px 0; font-size: 0.95rem; }
              .back { text-decoration: none; color: #8d6e63; font-weight: bold; display: inline-block; margin-bottom: 15px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
              
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
