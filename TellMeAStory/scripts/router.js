var root = null;
var useHash = true; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);

function configRouter() {
    router.on({
            "*": function (p, query) {
                if (query != null && query.trim().length > 0) {
                    console.log(query)
                    playFromUrl(query)
                }
            }
        })
        .resolve();
}
