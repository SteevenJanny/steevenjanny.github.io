const htmlModules = import.meta.glob('/slidedecks/slides/**/*.html', {
    query: '?raw',
    import: 'default'
});

export default {
    id: 'external',
    isReady: false,

    init(deck) {
        const config = deck.getConfig() || {};
        config.external = config.external || {};

        const options = {
            async: !!config.external.async,
            mapAttributes: config.external.mapAttributes instanceof Array
                ? config.external.mapAttributes
                : (config.external.mapAttributes ? ['src'] : [])
        };

        function getTarget(node) {
            let url = node.getAttribute('data-external') || '';
            let isReplace = false;

            if (url === '') {
                url = node.getAttribute('data-external-replace') || '';
                isReplace = true;
            }

            if (url.length > 0) {
                const r = url.match(/^([^#]+)(?:#(.+))?/);
                return {
                    url: r[1] || "",
                    fragment: r[2] || "",
                    isReplace
                };
            }
            return null;
        }

        function convertUrl(src, path) {
            if (path !== '' && src.indexOf('.') === 0) {
                return path + '/' + src;
            }
            return src;
        }

        function convertAttributes(attributeName, container, path) {
            const nodes = container.querySelectorAll('[' + attributeName + ']');

            if (container.getAttribute(attributeName)) {
                container.setAttribute(
                    attributeName,
                    convertUrl(container.getAttribute(attributeName), path)
                );
            }

            for (let i = 0; i < nodes.length; i++) {
                nodes[i].setAttribute(
                    attributeName,
                    convertUrl(nodes[i].getAttribute(attributeName), path)
                );
            }
        }

        function convertUrls(container, path) {
            for (let i = 0; i < options.mapAttributes.length; i++) {
                convertAttributes(options.mapAttributes[i], container, path);
            }
        }

        async function updateSection(section, target, path) {

            const fullPath = path !== ""
                ? `${path}/${target.url}`
                : target.url;

            const loader = htmlModules[fullPath];
            if (!loader) {
                console.error(`External file not found in bundle: ${fullPath}`);
                return;
            }

            const htmlText = await loader();

            const html = new DOMParser().parseFromString(
                htmlText,
                'text/html'
            );

            let nodes;

            if (target.fragment !== '') {
                nodes = html.querySelectorAll(target.fragment);
            } else {
                nodes = html.body.childNodes;
            }

            if (!target.isReplace) {
                section.innerHTML = '';
            }

            const newPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

            for (const node of nodes) {

                if (node instanceof Element) {
                    convertUrls(node, newPath);
                }

                const imported = document.importNode(node, true);

                target.isReplace
                    ? section.parentNode.insertBefore(imported, section)
                    : section.appendChild(imported);

                if (options.async) {
                    deck.sync();
                    deck.setState(deck.getState());
                }

                if (imported instanceof Element) {
                    await loadExternal(imported, newPath);
                }
            }

            if (target.isReplace) {
                section.parentNode.removeChild(section);
            }
        }

        async function loadExternal(container, path = "") {

            if (
                container instanceof Element &&
                (
                    container.getAttribute('data-external') ||
                    container.getAttribute('data-external-replace')
                )
            ) {

                const target = getTarget(container);
                if (target) await updateSection(container, target, path);

            } else {

                const sections = container.querySelectorAll(
                    '[data-external], [data-external-replace]'
                );

                for (const section of sections) {
                    const target = getTarget(section);
                    if (target) await updateSection(section, target, path);
                }
            }
        }

        loadExternal(document.body).then(() => {
            deck.sync();
            deck.dispatchEvent({ type: "externalready" });
            // this.isReady = true;
        });
    }
};
