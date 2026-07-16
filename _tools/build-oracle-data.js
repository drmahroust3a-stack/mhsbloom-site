// Build the neutral GPT knowledge file + the public GitHub dataset CSV.
// FREE-TIER FIELDS ONLY — no verdicts, no doseNote, no deepMoA (those are PRO/gated).
const fs = require('fs');
const path = require('path');
const brands = require('../_data/catalog-export.json');

const clean = (s) => (s == null ? '' : String(s).replace(/\s+/g, ' ').trim());
const csvCell = (s) => {
  const v = clean(s);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

const rows = [];
const oracle = [];
for (const b of brands) {
  if (b.isActive === false) continue;
  const brandEn = clean(b.brandName), brandAr = clean(b.brandNameAr);
  const origin = clean(b.country);
  for (const p of (b.products || [])) {
    if (p.isActive === false) continue;
    const ings = Array.isArray(p.keyIngredients) ? p.keyIngredients.map(clean).filter(Boolean) : [];
    const concerns = Array.isArray(p.skinConcerns) ? p.skinConcerns.map(clean).filter(Boolean) : [];
    rows.push([
      csvCell(p.name), csvCell(brandEn), csvCell(brandAr), csvCell(origin),
      csvCell(p.categoryId), csvCell(p.line), csvCell(p.size),
      csvCell(ings.join('; ')), csvCell(concerns.join('; ')),
      csvCell(p.skinType && (p.skinType.en || p.skinType)), csvCell(p.texture),
      csvCell(p.scentProfile), csvCell(p.whenToUse), csvCell(p.priceRange),
    ].join(','));
    // compact line for the GPT (name | brand | ingredients | concerns | fragrance | price band)
    oracle.push([
      clean(p.name), brandEn, ings.slice(0, 6).join(', '),
      concerns.slice(0, 4).join(', '), clean(p.scentProfile),
      clean(p.priceRange), clean(p.categoryId),
    ].join(' | '));
  }
}

const header = 'product_name,brand_en,brand_ar,brand_origin,category,line,size,key_ingredients,concerns_addressed,skin_type,texture,fragrance,when_to_use,price_band';
fs.mkdirSync(path.join(__dirname, '..', '_data', 'oracle'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', '_data', 'oracle', 'dataset.csv'), header + '\n' + rows.join('\n'), 'utf8');
fs.writeFileSync(path.join(__dirname, '..', '_data', 'oracle', 'oracle-knowledge.txt'),
  '# MHS BLOOM neutral product index (name | brand | key ingredients | concerns | fragrance | price band | category)\n' + oracle.join('\n'), 'utf8');

console.log('CSV rows:', rows.length);
console.log('oracle lines:', oracle.length);
console.log('CSV bytes:', fs.statSync(path.join(__dirname,'..','_data','oracle','dataset.csv')).size);
console.log('knowledge bytes:', fs.statSync(path.join(__dirname,'..','_data','oracle','oracle-knowledge.txt')).size);
