import { Wappalyzer, technologies, categories } from 'wapalyzer-core';
Wappalyzer.setTechnologies(technologies);
Wappalyzer.setCategories(categories);
const result = Wappalyzer.analyze({
  url: 'https://example.com',
  html: '<html><head><meta name="generator" content="WordPress 6.0"></head><body></body></html>',
  headers: { server: 'nginx/1.20.1' },
  scripts: [],
  meta: { generator: 'WordPress 6.0' },
});
console.log(JSON.stringify(result, null, 2));
