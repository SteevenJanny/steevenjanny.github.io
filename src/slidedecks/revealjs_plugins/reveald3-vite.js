const modules = import.meta.glob('/slidedecks/figures/**/*.js');

export default {
    id: "reveald3-vite",
    async init(Reveal) {
        let instances = new Map();


        async function loadSlideVisualizations(slide) {

            // If slide is loaded using external file, we need to wait until it's loaded before we can query for visualization containers
            if (slide.dataset.external && slide.innerHTML === "") {
                await new Promise(res => {
                    const observer = new MutationObserver((mutations, obs) => {
                        if (slide.querySelector("[data-module]")) {
                            obs.disconnect();
                            res();
                        }
                    });
                    observer.observe(slide, {childList: true, subtree: true});
                });
            }

            const containers = slide.querySelectorAll("[data-module]");
            const slideInstances = [];

            if (!instances.has(getSlideId(slide))) {
                for (const container of containers) {
                    const modulePath = container.dataset.module;
                    // const mod = await import(/* @vite-ignore */ modulePath);
                    const loader = modules[modulePath];

                    if (!loader) {
                        throw new Error(`Unknown visualization module: ${modulePath}`);
                    }

                    const mod = await loader();

                    const create = mod.create || mod.default;

                    if (typeof create !== "function") {
                        throw new Error(
                            `Module "${modulePath}" must export a create() function`
                        );
                    }

                    const instance = await create(container, {
                        Reveal,
                        slide
                    })
                    slideInstances.push(instance);
                }
                instances.set(getSlideId(slide), slideInstances);
            }
            if (containers.length && MathJax?.typesetPromise) {
                const mj = MathJax;

                try {
                    // await mj.startup.promise;
                    // mj.typesetClear(containers);
                    await mj.typesetPromise(containers);
                } catch (err) {
                    console.error("MathJax typeset failed:", err);
                }
            }
            Reveal.layout();
        }

        function getSlideId(slide) {
            const {h, v} = Reveal.getIndices(slide);
            return `${h}-${v}`;
        }

        function getSlideInstances(slide) {
            return instances.get(getSlideId(slide)) || [];
        }

        let slideReadyResolve;
        let slideReady = new Promise(res => {
            slideReadyResolve = res;
        });

        Reveal.on("slidechanged", async (event) => {
            Reveal.sync();
            const {currentSlide, previousSlide} = event;
            await loadSlideVisualizations(currentSlide);

            if (previousSlide) {
                for (const inst of getSlideInstances(previousSlide)) {
                    inst.onSlideLeave?.();
                }
            }

            for (const inst of getSlideInstances(currentSlide)) {
                inst.onSlideEnter?.();
            }
            slideReadyResolve();
        });

        Reveal.on("fragmentshown", async (event) => {
            await slideReady;
            const step = parseInt(event.fragment.dataset.fragmentIndex);
            const slide = event.fragment.closest("section");
            for (const inst of getSlideInstances(slide)) {
                const transition = inst.steps?.find(s => s.index === step);
                transition?.forward?.();
            }
        });
        Reveal.on('fragmenthidden', (event) => {
            const step = parseInt(event.fragment.dataset.fragmentIndex);
            const slide = event.fragment.closest('section');
            for (const inst of getSlideInstances(slide)) {
                const transition = inst.steps?.find(s => s.index === step);
                transition?.backward?.();
            }
        });
    }
}
