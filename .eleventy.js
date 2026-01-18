module.exports = function(eleventyConfig) {
  // Tell Eleventy to process .cook files as HTML
  eleventyConfig.addTemplateFormats("cook");

  eleventyConfig.addExtension("cook", {
    compile: async (inputContent) => {
      return async () => {
        // This is where we format Mildred's recipes
        // We use simple regex to keep it light and stable
        let formatted = inputContent
          .replace(/>>(.*?)\n/g, '<p class="note"><strong>Mildred\'s Note:</strong> $1</p>')
          .replace(/@([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="ing"><strong>$2</strong> $1</span>')
          .replace(/#([\w\s]+)\{([\d\/\.\w\s%]*)\}/g, '<span class="tool">$1</span>')
          .replace(/\n/g, '<br>');

        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <title>Loving Memories of Mildred</title>
            <style>
              body { font-family: 'Georgia', serif; background: #fdfaf7; color: #4e342e; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; }
              h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; }
              .note { background: #efebe9; padding: 15px; border-radius: 5px; font-style: italic; border-left: 5px solid #8d6e63; }
              .ing { background: #fff; border: 1px solid #d7ccc8; padding: 2px 6px; border-radius: 4px; margin: 2px; display: inline-block; }
              .tool { color: #795548; font-weight: bold; }
              a { color: #8d6e63; }
            </style>
          </head>
          <body>
            <a href="/">← Back to Collection</a>
            <h1>Recipe</h1>
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
      output: "_site" // This is the folder Render will serve
    }
  };
};
