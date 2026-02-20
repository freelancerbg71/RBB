const http = require('http');

http.get('http://127.0.0.1:4321/blog/prediction-markets-vs-sports-betting', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const regex = /<img[^>]+src="([^"]+)"/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
            console.log('Found image src:', match[1]);
        }
    });
});
}).on('error', (err) => {
    console.error(err.message);
});
