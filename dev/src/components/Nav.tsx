/** The two pages of the dev app. */
export type Page = 'search' | 'functions';

/**
 * The links between the dev app's pages. They are plain links: each page loads what it needs.
 * @param props - Which page is open.
 * @param props.current - The open page, marked in the list.
 * @returns The navigation line.
 */
export function Nav({ current }: { current: Page }) {
  return (
    <nav className="nav">
      <a href="/" className={current === 'search' ? 'active' : ''}>
        batch search
      </a>
      <a href="/functions" className={current === 'functions' ? 'active' : ''}>
        function keys
      </a>
    </nav>
  );
}
