const https = require('https');

const urls = [
  'obec/abraham/abraham.html',
  'obec/bratislava/bratislava.html',
  'obec/kosice/kosice.html',
  'obec/zilina/zilina.html',
  'obec/banovce-nad-bebravou/banovce-nad-bebravou.html'
];

async function test() {
  for (const urlPath of urls) {
    const url = 'https://www.e-obce.sk/' + urlPath;

    const html = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    const emailMatches = html.match(/mailto:([^">\s]+)/gi) || [];
    const emails = emailMatches
      .map(m => m.replace('mailto:', '').trim())
      .filter(e => e.includes('@') && !e.includes('e-obce.sk'));

    console.log(urlPath.split('/')[1] + ': ' + (emails.length > 0 ? emails.join(', ') : 'bez emailu'));
  }
}

test();
