const fs = require('fs');
['login', 'register'].forEach(page => {
    let file = fs.readFileSync('src/app/' + page + '/page.jsx', 'utf8');
    file = file.split('export default function')[0];
    const componentName = page === 'login' ? 'LoginPage' : 'RegisterPage';
    const formName = page === 'login' ? 'LoginForm' : 'RegisterForm';
    file += 'export default function ' + componentName + '() { \n    return (\n        <Suspense fallback={\n            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">\n                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />\n            </div>\n        }>\n            <' + formName + ' />\n        </Suspense>\n    ); \n}';
    fs.writeFileSync('src/app/' + page + '/page.jsx', file);
});
