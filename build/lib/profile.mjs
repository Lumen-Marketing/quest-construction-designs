// The two products this generator makes.
//
// The difference between them used to be a bare object — { hubs, rich, built,
// absolute } — handed down through four modules, each reaching in for whatever
// keys it happened to care about. Three unrelated concerns rode together:
// hubs is routing, rich and built are structured data, absolute is path style.
// The resolver received schema flags it never read and the schema module
// received routing flags it never read.
//
// Now each layer asks the profile a question. The whole difference between the
// demo directions and the standalone site is readable in this one file.
import { resolver, absoluteResolver } from './url.mjs';
import { pageList } from './pages.mjs';
import { stylesheetName } from './site-css.mjs';

/**
 * When the standalone site was last generated. Stamped into the sitemap's
 * <lastmod> and the WebPage dateModified — the same fact, so one value. A
 * rolling "today" would churn the sitemap on every build and tell crawlers the
 * content changed when it did not.
 */
export const BUILT = '2026-08-22';

function makeProfile({ name, hubs, cityServices, blog, richSchema, built, fingerprintCss }) {
  // pageList re-reads the content files, so the manifest is built once.
  let manifest = null;

  return {
    name,
    /** Whether the two section landing pages exist in this product. */
    hubs,

    /** Whether the trade-by-city landing pages exist in this product. */
    cityServices,

    /** Whether the blog exists in this product. */
    blog,

    /** The page manifest this product renders. */
    pages() {
      if (!manifest) manifest = pageList({ hubs, cityServices, blog });
      return manifest;
    },

    /**
     * How this product addresses things. `absolute` asks for root-absolute
     * paths, which only the 404 needs: it is served in place of whatever URL
     * was requested, so a relative path would resolve against the missing one.
     */
    resolverFor(slug, key, { absolute = false } = {}) {
      return absolute ? absoluteResolver({ hubs }) : resolver(slug, key, { hubs });
    },

    /** How much structured data this product carries, and its freshness stamp. */
    schemaOpts() {
      return { rich: richSchema, built };
    },

    /**
     * What this product's stylesheet is called, relative to its site folder.
     *
     * The standalone fingerprints it, because its host is told /assets/* is
     * `immutable` for a year — a promise that only holds for a file whose name
     * changes with its contents. The ten demo directions are served off the
     * repo root with no such header, and hashing there would rewrite 310 pages
     * every time anyone touched a colour.
     */
    stylesheet() {
      return fingerprintCss ? `assets/${stylesheetName()}` : 'assets/styles.css';
    },
  };
}

/**
 * The ten demo directions: thirty-one pages, no section landing pages, the lean
 * business node. They are noindex, so ten copies of an offer catalogue never
 * reach an index.
 */
export const demoProfile = makeProfile({
  name: 'demo', hubs: false, cityServices: false, blog: false, richSchema: false, built: null,
  fingerprintCss: false,
});

/**
 * The standalone site: the two hubs, the trade-by-city landing pages, the
 * fuller business node, and a last-modified stamp. The ten demo directions
 * carry none of them — they are noindex, and 340 extra pages that never reach
 * an index is a lot of build for nothing.
 */
export const siteProfile = makeProfile({
  name: 'site', hubs: true, cityServices: true, blog: true, richSchema: true, built: BUILT,
  fingerprintCss: true,
});
