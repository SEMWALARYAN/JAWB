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
  [/text-white/g, 'text-black'],
  [/text-gray-400/g, 'text-gray-700'],
  [/text-gray-500/g, 'text-gray-800'],
  [/text-gray-300/g, 'text-gray-600'],
  [/text-gray-200/g, 'text-gray-700'],
  [/text-gray-100/g, 'text-gray-800'],
  [/border-white\/10/g, 'border-black'],
  [/border-white\/5/g, 'border-black'],
  [/border-white\/20/g, 'border-black'],
  [/bg-white\/5/g, 'bg-gray-100'],
  [/bg-white\/10/g, 'bg-gray-200'],
  [/bg-white\/20/g, 'bg-gray-300'],
  [/bg-indigo-600/g, 'bg-white'],
  [/bg-red-600/g, 'bg-white'],
  [/text-indigo-400/g, 'text-black'],
  [/bg-transparent/g, 'bg-white'],
  [/shadow-sm/g, 'shadow-[4px_4px_0_0_rgba(0,0,0,1)]'],
  [/shadow-md/g, 'shadow-[6px_6px_0_0_rgba(0,0,0,1)]'],
  [/shadow-lg/g, 'shadow-[8px_8px_0_0_rgba(0,0,0,1)]'],
  [/shadow-2xl/g, 'shadow-[12px_12px_0_0_rgba(0,0,0,1)]'],
  [/rounded-2xl/g, 'rounded-none'],
  [/rounded-xl/g, 'rounded-none'],
  [/rounded-lg/g, 'rounded-none'],
  [/rounded-md/g, 'rounded-none'],
  [/rounded-full/g, 'rounded-none'],
  [/border-b /g, 'border-b-2 border-black '],
  [/border-r /g, 'border-r-2 border-black ']
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
