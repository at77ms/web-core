export function loadCssAndJs(urls: string[], callback?: (urls) => void) {
    let count = 0;
    urls.forEach((url: string) => {
        let element;
        if (url.endsWith('.js')) {
            element = document.createElement('script');
            element.src = url;
            element.type = 'text/javascript';
            element.async = true;
        }
        if (url.endsWith('.css')) {
            element = document.createElement('link');
            element.rel = 'stylesheet';
            element.href = url;
        }
        if (callback) {
            element.addEventListener('load', () => {
                count++;
                if (count === urls.length) {
                    callback(urls);
                }
            });
        }
        document.getElementsByTagName('head')[0].appendChild(element);
    });
}
