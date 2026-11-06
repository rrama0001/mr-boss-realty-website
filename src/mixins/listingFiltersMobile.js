/** Collapsible sticky listing filters for viewports under 768px. */
export default {
    data() {
        return {
            filtersExpanded: false,
            filtersToggleStuck: false,
        };
    },
    mounted() {
        this.bindFiltersToggleScroll();
        this.observeFiltersToggle();
    },
    updated() {
        this.observeFiltersToggle();
    },
    beforeUnmount() {
        this.teardownFiltersToggle();
    },
    methods: {
        toggleListingFilters() {
            this.filtersExpanded = !this.filtersExpanded;
        },
        bindFiltersToggleScroll() {
            if (this._filtersToggleScrollBound) return;

            this._filtersToggleScrollBound = () => {
                if (this._filtersToggleRaf) return;
                this._filtersToggleRaf = window.requestAnimationFrame(() => {
                    this._filtersToggleRaf = 0;
                    this.syncFiltersToggleStuck();
                });
            };
            document.body.addEventListener('scroll', this._filtersToggleScrollBound, { passive: true });
            window.addEventListener('scroll', this._filtersToggleScrollBound, { passive: true });
            window.addEventListener('resize', this._filtersToggleScrollBound, { passive: true });
        },
        syncFiltersToggleStuck() {
            const sentinel = this.$refs.filtersToggleSentinel;
            if (!sentinel || window.innerWidth >= 768) {
                if (this.filtersToggleStuck) this.filtersToggleStuck = false;
                return;
            }

            const header = document.querySelector('.site-header');
            const headerBottom = header ? header.getBoundingClientRect().bottom : 80;
            const stuck = sentinel.getBoundingClientRect().top < headerBottom - 0.5;
            if (stuck !== this.filtersToggleStuck) {
                this.filtersToggleStuck = stuck;
            }
        },
        observeFiltersToggle() {
            const sentinel = this.$refs.filtersToggleSentinel;
            if (!sentinel || typeof IntersectionObserver === 'undefined') {
                this.syncFiltersToggleStuck();
                return;
            }
            if (this._filtersToggleObservedEl === sentinel) {
                this.syncFiltersToggleStuck();
                return;
            }

            this._filtersToggleObserver?.disconnect();
            const header = document.querySelector('.site-header');
            const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 80;
            this._filtersToggleObserver = new IntersectionObserver(() => {
                this.syncFiltersToggleStuck();
            }, {
                root: null,
                threshold: [0, 1],
                rootMargin: `-${headerHeight}px 0px 0px 0px`,
            });
            this._filtersToggleObserver.observe(sentinel);
            this._filtersToggleObservedEl = sentinel;
            this.syncFiltersToggleStuck();
        },
        teardownFiltersToggle() {
            this._filtersToggleObserver?.disconnect();
            this._filtersToggleObserver = null;
            this._filtersToggleObservedEl = null;
            if (this._filtersToggleScrollBound) {
                document.body.removeEventListener('scroll', this._filtersToggleScrollBound);
                window.removeEventListener('scroll', this._filtersToggleScrollBound);
                window.removeEventListener('resize', this._filtersToggleScrollBound);
                this._filtersToggleScrollBound = null;
            }
            if (this._filtersToggleRaf) {
                cancelAnimationFrame(this._filtersToggleRaf);
                this._filtersToggleRaf = 0;
            }
        },
    },
};
