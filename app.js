const http = require("http");

function get(n, callback) {
	var text = '';
	var options = {
	  host: 'proxylist.hidemyass.com',
	  port: 80,
	  path: '/'+n
	};

	http.get(options, (res) => {
	  res.on("data", (chunk) => {
	    text += chunk;
	  }).on('end', () => {	
	  	var bad_class = "("
	  	var lines = text.split(/\r?\n/);
	  	lines.forEach(line => {
	  		var class_name = line.match(/\.([a-zA-Z0-9_\-]{4})\{display:none\}/);
	  		if (class_name != null) {
	  			bad_class += class_name[1] + '|';
	  		}
	  	});
  		bad_class = bad_class.replace(/\|$/, '') + ')'
  		var to_remove = '(<span class\="'+ bad_class + '">[0-9]{1,3}</span>|<span style=\"display:(none|inline)\">[0-9]{1,3}</span>|<div style="display:none">[0-9]{1,3}</div>|<span class="[a-zA-Z0-9_\-]{1,4}">|</?span>|<span style="display: inline">)';
  		var junk = new RegExp(to_remove, "gm");
  		junk = text.replace(junk, '');
  		junk = junk.replace(/\r?\n|\r/g, '');

  		var re = new RegExp(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\s*<\/td>\s*<td>\s*([0-9]{2,6}).{100,1200}(socks4\/5|HTTPS?)/, 'gm');//');		
		var urls = new Array();
		while((match = re.exec(junk)) !== null){
		    var proto = '';
		    if (match[3] == 'socks4/5') {
		    	proto = 'socks5h'
		    } else {
		    	proto = match[3].toLowerCase();
		    }
		    var ip = match[1];
		    var port = match[2];
		    urls.push(proto + '://' + ip + ':' + port);
		}
		callback(null, urls);
	  });
	}).on('error', (e) => {
	  callback(e);
	});
}

function promiseGetAll() {
	return new Promise((success, error) => {
		var promises = [];
		var globalList = [];
		for (let i = 1; i < 6; i++) {
			promises.push(new Promise((done, reject) => {
				get(i, (err, list) => {
					if (err) reject(err);

					globalList = globalList.concat(list);
					done();
				});				
			}));
		}
		Promise.all(promises).then(() => {
			success(globalList);
		}, (err) => {
			error(err);
		});
	});
}

promiseGetAll().then((list) => {
	console.log(list);
});
