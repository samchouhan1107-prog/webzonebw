import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

// Map of mojibake patterns to their correct replacements
const mojibakeFixes = [
  // Triple-encoded em-dash (—)
  ['ÃÂ¢Ã¢âÂ¬Ã¢âÂ¦ï¿½', '\u2014'],
  ['ÃÂ¢Ã¢âÂ¬Ã¯Â¿Â½', '\u2014'],
  ['ÃÂ¢Ã¢âÂ¬Ã¢âÂ¯', '\u2014'],
  ['ÃÂ¢Ã¢âÂ¬Ã¯Â¿', '\u2014'],
  ['ÃÂ¢Ã¢âÂ¬', '\u2014'],
  
  // Triple-encoded bullet (·)
  ['ÃÂ¢Ã¢âÂ¬ÃÂ¢', '\u00b7'],
  ['ÃÂ¢Ã¢âÂ¬', '\u00b7'],
  
  // Triple-encoded en-dash (–)
  ['ÃÂ¢Ã¢âÂ¬Ã¢âÂ', '\u2013'],
  
  // Triple-encoded left/right double quotes
  ['ÃÂ¢Ã¢âÂ¬Ã¯Â¿Â½', '\u201c'],
  ['ÃÂ¢Ã¢âÂ¬Ã¯Â¿Â½', '\u201d'],
  
  // Triple-encoded copyright (©)
  ['ÃÂ¢Ã¢âÂ©', '\u00a9'],
  ['ÃÂ©', '\u00a9'],
  
  // Triple-encoded music note (♪)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ¿ÃÂ½', '\ud83c\udfb5'],
  
  // Triple-encoded fire emoji (🔥)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ¿ÃÂ¼', '\ud83d\udd25'],
  
  // Triple-encoded house emoji (🏠)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ¿ÃÂ½', '\ud83c\udfe0'],
  
  // Triple-encoded VR emoji (🥽)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ®', '\ud83e\uddd1'],
  
  // Triple-encoded folder emoji (📁)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¦ÃÂ¼', '\ud83d\udcc1'],
  
  // Triple-encoded document emoji (📄)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¯ÃÂ½', '\ud83d\udcc4'],
  
  // Triple-encoded book emoji (📖)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¯Ã¿', '\ud83d\udcd6'],
  
  // Triple-encoded speaker emoji (🔊)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂµ', '\ud83d\udd0a'],
  
  // Triple-encoded users emoji (👥)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ¿ÃÂ¤', '\ud83d\udc65'],
  
  // Triple-encoded envelope emoji (✉)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ²ÃÂ°', '\u2709'],
  
  // Triple-encoded shield emoji (🛡)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ²ÃÂ®', '\ud83d\udee1'],
  
  // Triple-encoded cookie emoji (🍪)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ¿ÃÂª', '\ud83c\udf6a'],
  
  // Triple-encoded lock emoji (🔒)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂµÃÂ¿', '\ud83d\udd12'],
  
  // Triple-encoded contract emoji (📜)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¯ÃÂ¹', '\ud83d\udcdc'],
  
  // Triple-encoded moon emoji (🌙)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¡ÃÂ¢', '\ud83c\udf19'],
  
  // Triple-encoded user emoji (👤)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ¿ÃÂ½', '\ud83d\udc64'],
  
  // Triple-encoded sliders emoji (🎛)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¡ÃÂ¿', '\ud83c\udf9c'],
  
  // Triple-encoded chart emoji (📊)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¦', '\ud83d\udcca'],
  
  // Triple-encoded diamond emoji (💎)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ²ÃÂ½', '\ud83d\udc8e'],
  
  // Triple-encoded arrow emoji (▶)
  ['ÃÂ¢Ã¢âÂ¬Ã¯Â¿Â½', '\u25b6'],
  
  // Triple-encoded reset emoji (🔄)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ²ÃÂ¬', '\ud83d\udd04'],
  
  // Triple-encoded lightbulb emoji (💡)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¡', '\ud83d\udca1'],
  
  // Triple-encoded CD emoji (💿)
  ['ÃÂ°ÃÂ¸ÃÂ¢ÃÂ²ÃÂ¾', '\ud83d\udcbf'],
  
  // Triple-encoded vinyl emoji (🎵)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂµÃÂ½', '\ud83c\udfb5'],
  
  // Triple-encoded guitar emoji (🎸)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¶', '\ud83c\udfb8'],
  
  // Triple-encoded piano emoji (🎹)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ·', '\ud83c\udfb9'],
  
  // Triple-encoded drum emoji (🥁)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¸', '\ud83c\udf89'],
  
  // Triple-encoded trumpet emoji (🎺)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ»', '\ud83c\udfb7'],
  
  // Triple-encoded sunset emoji (🌅)
  ['ÃÂ°ÃÂ¸ÃÂ§ÃÂ¿', '\ud83c\udf05'],
  
  // Triple-encoded microscope emoji (🔬)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¦', '\ud83d\udd2c'],
  
  // Triple-encoded headphones emoji (🎧)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ²', '\ud83c\udfa7'],
  
  // Triple-encoded film emoji (🎞)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ½', '\ud83c\udf9e'],
  
  // Triple-encoded studio emoji (🎛)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¾', '\ud83c\udf9b'],
  
  // Triple-encoded wave emoji (🌊)
  ['ÃÂ°ÃÂ¸ÃÂ§ÃÂ²', '\ud83c\udf0a'],
  
  // Triple-encoded star emoji (⭐)
  ['ÃÂ°ÃÂ¸ÃÂ¥ÃÂ¡', '\u2b50'],
  
  // Triple-encoded heart emoji (❤)
  ['ÃÂ°ÃÂ¸ÃÂ¯ÃÂ²ÃÂ½', '\u2764'],
  
  // Triple-encoded music symbols
  ['ÃÂ°ÃÂ¸ÃÂ§ÃÂ½', '\ud83c\udfb6'],
  
  // Triple-encoded arrow symbols
  ['ÃÂ¢Ã¢âÂ¬', '\u2192'],
  
  // Triple-encoded checkmark
  ['ÃÂ¢Ã¢âÂ¦', '\u2714'],
  
  // Triple-encoded X mark
  ['ÃÂ¢Ã¢âÂ', '\u2718'],
  
  // Triple-encoded dash
  ['ÃÂ¢Ã¢âÂ¬', '\u2014'],
  
  // Additional patterns from the files
  ['Ã\u0083Â¢Ã\u0082Â¢Ã¢â\u0082Â¬Ã¢â\u0082Â¦ï¿½', '\u2014'],
  ['Ã\u0083Â¢Ã\u0082Â¢Ã¢â\u0082Â¬', '\u2014'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â¿Ã\u0083Â½', '\ud83c\udfb5'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¢Ã\u0083Â²Ã\u0083Â®', '\ud83e\uddd1'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¢Ã\u0083Â²Ã\u0083Â¦Ã\u0083Â¼', '\ud83d\udcc1'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Âµ', '\ud83d\udd0a'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â¿Ã\u0083Â¤', '\ud83d\udc65'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â²Ã\u0083Â°', '\u2709'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â²Ã\u0083Â®', '\ud83d\udee1'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â¿Ã\u0083Âª', '\ud83c\udf6a'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083ÂµÃ\u0083Â¿', '\ud83d\udd12'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¢Ã\u0083Â²Ã\u0083Â¯Ã\u0083Â¹', '\ud83d\udcdc'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¡Ã\u0083Â¢', '\ud83c\udf19'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â¿Ã\u0083Â½', '\ud83d\udc64'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¡Ã\u0083Â¿', '\ud83c\udf9c'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¢Ã\u0083Â²Ã\u0083Â¦', '\ud83d\udcca'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â²Ã\u0083Â½', '\ud83d\udc8e'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â²Ã\u0083Â¬', '\ud83d\udd04'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¢Ã\u0083Â²Ã\u0083Â¡', '\ud83d\udca1'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¢Ã\u0083Â²Ã\u0083Â¾', '\ud83d\udcbf'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083ÂµÃ\u0083Â½', '\ud83c\udfb5'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¶', '\ud83c\udfb8'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â·', '\ud83c\udfb9'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¸', '\ud83c\udf89'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â»', '\ud83c\udfb7'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â§Ã\u0083Â¿', '\ud83c\udf05'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¦', '\ud83d\udd2c'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â²', '\ud83c\udfa7'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â½', '\ud83c\udf9e'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¾', '\ud83c\udf9b'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â§Ã\u0083Â²', '\ud83c\udf0a'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¥Ã\u0083Â¡', '\u2b50'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â¯Ã\u0083Â²Ã\u0083Â½', '\u2764'],
  ['Ã\u0083Â°Ã\u0083Â¸Ã\u0083Â§Ã\u0083Â½', '\ud83c\udfb6'],
  ['Ã\u0083Â¢Ã\u0082Â¢Ã¢â\u0082Â¬', '\u2192'],
  ['Ã\u0083Â¢Ã\u0082Â¦', '\u2714'],
  ['Ã\u0083Â¢Ã\u0082Â', '\u2718'],
  ['Ã\u0083Â¢Ã\u0082Â¢Ã¢â\u0082Â¬', '\u2014'],
];

function fixMojibake(content) {
  let fixed = content;
  let count = 0;
  
  for (const [from, to] of mojibakeFixes) {
    if (fixed.includes(from)) {
      fixed = fixed.split(from).join(to);
      count++;
    }
  }
  
  return { fixed, count };
}

// Process all HTML files in the directory
const dir = 'C:\\Users\\HP\\Downloads\\WebZoneBW.in';
const files = readdirSync(dir).filter(f => extname(f) === '.html');

let totalFixes = 0;
let filesFixed = 0;

for (const file of files) {
  const filePath = join(dir, file);
  try {
    const content = readFileSync(filePath, 'utf8');
    const { fixed, count } = fixMojibake(content);
    
    if (count > 0) {
      // Write back with UTF-8 BOM
      writeFileSync(filePath, '\ufeff' + fixed.replace(/^\ufeff/, ''), 'utf8');
      console.log(`Fixed ${file}: ${count} replacements`);
      totalFixes += count;
      filesFixed++;
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

// Also process articles directory
const articlesDir = join(dir, 'articles');
try {
  const articleDirs = readdirSync(articlesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const subDir of articleDirs) {
    const indexPath = join(articlesDir, subDir, 'index.html');
    try {
      const content = readFileSync(indexPath, 'utf8');
      const { fixed, count } = fixMojibake(content);
      
      if (count > 0) {
        writeFileSync(indexPath, '\ufeff' + fixed.replace(/^\ufeff/, ''), 'utf8');
        console.log(`Fixed articles/${subDir}/index.html: ${count} replacements`);
        totalFixes += count;
        filesFixed++;
      }
    } catch (err) {
      // Skip if file doesn't exist
    }
  }
} catch (err) {
  // Skip if articles directory doesn't exist
}

console.log(`\nTotal: ${totalFixes} fixes across ${filesFixed} files`);
