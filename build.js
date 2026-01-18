const cooklang = require('cooklang');
const fs = require('fs-extra');
const path = require('path');

const recipesDir = './recipes';
const distDir = './public';

fs.ensureDirSync(distDir);

const files = fs.readdirSync(recipesDir).filter(f => f.endsWith('.cook'));

// Simple CSS for a "Memory Book" feel
const style = `
<style>
    body { font-family: 'Georgia', serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; background-color: #fdfaf7; }
    h1 { color: #5d4037; border-bottom: 2px solid #d7ccc8; padding-bottom: 10px; }
    .recipe-card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 15px rgba(0,0,0,0.05); }
    .metadata { font-style: italic; color: #8d6e63; margin-bottom: 20px; }
    ul { list-style-type: none; padding: 0; }
    li { background: #efebe9; margin: 5px 0; padding: 8px 12px; border-radius: 4px; }
    .steps { margin-top: 20px; white-space: pre-line; }
    .back-link { display: inline-block; margin-top: 30px; text-decoration: none; color: #8d6e63; font-weight: bold; }
</style>
`;

let indexHtml = `${style} <div class="recipe-card"><h1>Loving Memories of Mildred</h1><p>Her kitchen, her heart, her recipes.</p><ul>`;

files.forEach(file => {
    const content = fs.readFileSync(path.join(recipesDir, file), 'utf8');
    const recipe = cooklang.parse(content);
    const recipeName = file.replace('.cook', '').replace(/_/g, ' ');
    const fileName = file.replace('.cook', '.html');
    
    const recipeHtml = `
        ${style}
        <div class="recipe-card">
            <h1>${recipeName}</h1>
            <div class="metadata">Mildred's Kitchen Collection</div>
            
            <h3>Ingredients</h3>
            <ul>${recipe.ingredients.map(i => `<li><strong>${i.quantity} ${i.unit}</strong> ${i.name}</li>`).join('')}</ul>
            
            <h3>Instructions</h3>
            <div class="steps">${recipe.steps.map(s => s.line).join('\n\n')}</div>
            
            <a href="index.html" class="back-link">← Back to the Collection</a>
        </div>
    `;
    
    fs.writeFileSync(path.join(distDir, fileName), recipeHtml);
    indexHtml += `<li><a href="${fileName}" style="text-decoration:none; color:#5d4037; font-weight:bold;">${recipeName}</a></li>`;
});

indexHtml += '</ul></div>';
fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
