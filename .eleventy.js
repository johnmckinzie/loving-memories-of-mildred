module.exports = function(eleventyConfig) {
  // This tells Eleventy to look deep into subfolders
  eleventyConfig.addTemplateFormats("cook");

  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async (data) => {
        // Simple formatting logic for the Cooklang text
        let formatted = inputContent
          .replace(/>>(.*?)\n/g, '<p class="note"><strong>Mildred\'s Note:</strong> $1</p>')
          .replace(/@([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          .replace(/#([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="tool">$1</span>')
          .replace(/\n/g, '<br>');

        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Mildred's Kitchen</title>
            <style>
              body { font-family: 'Georgia', serif; background: #fdfaf7; color: #4e342e; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; }
              h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; text-transform: capitalize; }
              .note { background: #efebe9; padding: 15px; border-radius: 5px; font-style: italic; border-left: 5px solid #8d6e63; margin: 20px 0; }
              .ing { background: #fff; border: 1px solid #d7ccc8; padding: 2px 6px; border-radius: 4px; margin: 2px; display: inline-block; }
              .nav-link { color: #8d6e63; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <a href="/" class="nav-link">← Home</a>
            <h1>${data.page.fileSlug.replace(/[-_]/g, ' ')}</h1>
            <div class="recipe-body">${formatted}</div>
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
