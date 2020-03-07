const fs = require('fs');
const path = require('path');

const currencies = require('./lib/currencies');

if (process.argv.length < 4) {
  console.log('Usage: node index.js <currency> <count>');
  process.exit(1);
}

const currency = process.argv[2];
const count = Number(process.argv[3]);

const generator = currencies[currency];

if (!generator) {
  console.error(`${currency} not supported`);
  process.exit(1);
}

const list = generator(count);

const outputFull = list.map(item => item.address + ';' + item.wif).join("\n");
const outputAddresses = list.map(item => item.address).join("\n");
const outputWIF = list.map(item => item.wif).join("\n");

const outputPath = path.join(
  process.cwd(),
  'output',
  currency,
  new Date().toISOString().slice(0, 19).replace(/[T]/g, '_')
);

fs.mkdir(outputPath, { recursive: true }, err => {
  if (err) throw err;

  fs.writeFileSync(path.join(outputPath, 'full.csv'), outputFull);
  fs.writeFileSync(path.join(outputPath, 'addresses.csv'), outputAddresses);
  fs.writeFileSync(path.join(outputPath, 'wif.csv'), outputWIF);

  console.log('Data in the catalog: ', outputPath);
});

