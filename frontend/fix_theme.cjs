const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx')) results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const replacements = [
  [/bg-white/g, 'glass-panel'],
  [/bg-gray-50\/80/g, 'bg-transparent'],
  [/bg-gray-50\/50/g, 'bg-white\/5'],
  [/bg-gray-50/g, 'bg-transparent'],
  [/text-gray-900/g, 'text-white'],
  [/text-gray-800/g, 'text-gray-100'],
  [/text-gray-700/g, 'text-gray-200'],
  [/text-gray-600/g, 'text-gray-300'],
  [/text-gray-500/g, 'text-gray-400'],
  [/border-gray-200/g, 'border-white/10'],
  [/border-gray-100/g, 'border-white/5'],
  [/border-gray-300/g, 'border-white/20'],
  [/bg-gray-100/g, 'bg-white/5'],
  [/bg-gray-200/g, 'bg-white/10'],
  [/bg-gray-900/g, 'bg-indigo-600'],
  [/hover:bg-gray-50/g, 'hover:bg-white/5'],
  [/hover:bg-gray-100/g, 'hover:bg-white/10'],
  [/hover:bg-gray-200/g, 'hover:bg-white/20'],
  [/hover:bg-gray-800/g, 'hover:bg-indigo-500'],
  [/hover:text-gray-900/g, 'hover:text-white'],
  [/bg-indigo-50/g, 'bg-indigo-500/20'],
  [/text-indigo-600/g, 'text-indigo-400'],
  [/text-indigo-700/g, 'text-indigo-300'],
  [/bg-blue-50/g, 'bg-blue-500/20'],
  [/text-blue-600/g, 'text-blue-400'],
  [/bg-emerald-50/g, 'bg-emerald-500/20'],
  [/text-emerald-600/g, 'text-emerald-400'],
  [/text-emerald-700/g, 'text-emerald-300'],
  [/border-emerald-200/g, 'border-emerald-500/30'],
  [/bg-indigo-100/g, 'bg-indigo-500/30'],
  [/text-gray-300/g, 'text-gray-500']
];

walk(path.join(__dirname, 'src'), (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Processed ${file}`);
    }
  });
});
