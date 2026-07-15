<script lang="ts">
  import { tick, type Snippet } from 'svelte';

  interface MasonryProps {
    stretchFirst?: boolean;
    gridGap?: string;
    colWidth?: string;
    rowHeight?: string;
    items?: unknown[];
    reset?: boolean;
    children: Snippet;
  }

  let {
    stretchFirst = false,
    gridGap = '0.5em',
    colWidth = 'minmax(Min(20rem, 100%), 1fr)',
    rowHeight = '8px',
    items = [],
    reset = false,
    children,
  }: MasonryProps = $props();

  let masonryElement: HTMLElement | null = null;

  const clearRowSpans = (items: HTMLElement[]): void => {
    items.forEach((item) => {
      item.style.removeProperty('grid-row-end');
      item.style.removeProperty('grid-row-start');
    });
  };

  const applyRowSpans = (el: HTMLElement): void => {
    const styles = getComputedStyle(el);
    const rowGap = Number.parseFloat(styles.rowGap || styles.gap || '0') || 0;
    const rowUnit =
      Number.parseFloat(styles.getPropertyValue('--row-height')) || 8;

    for (const child of Array.from(el.children)) {
      if (!(child instanceof HTMLElement)) continue;

      const height = child.getBoundingClientRect().height;
      const span = Math.max(
        1,
        Math.ceil((height + rowGap) / (rowUnit + rowGap)),
      );

      child.style.gridRowEnd = `span ${span}`;
    }
  };

  const refreshLayout = async (): Promise<void> => {
    if (!masonryElement) return;

    await tick();

    const items = Array.from(masonryElement.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );

    if (!items.length) return;

    const supportsNativeMasonry =
      CSS.supports?.('grid-template-rows', 'masonry') ||
      getComputedStyle(masonryElement).gridTemplateRows === 'masonry';

    if (supportsNativeMasonry) {
      clearRowSpans(items);
      return;
    }

    clearRowSpans(items);
    applyRowSpans(masonryElement);
  };

  let _window: Window | undefined;

  $effect(() => {
    items;
    reset;

    // on mount
    _window = window;
    const resizeObserver = new ResizeObserver(() => {
      void refreshLayout();
    });

    if (masonryElement) {
      resizeObserver?.observe(masonryElement);

      for (const child of Array.from(masonryElement.children)) {
        if (child instanceof HTMLElement) {
          resizeObserver?.observe(child);
        }
      }
    }

    _window.addEventListener('resize', refreshLayout, false);

    void refreshLayout();

    // cleanup, on destroy
    return () => {
      resizeObserver?.disconnect();

      if (_window) {
        _window.removeEventListener('resize', refreshLayout, false);
      }
    };
  });
</script>

<div
  bind:this={masonryElement}
  class={'__grid--masonry'}
  class:__stretch-first={stretchFirst}
  style:--grid-gap={gridGap}
  style:--col-width={colWidth}
  style:--row-height={rowHeight}
>
  {@render children()}
</div>

<style>
  :global(.__grid--masonry) {
    display: grid;
    grid-template-columns: repeat(auto-fit, var(--col-width));
    grid-auto-rows: var(--row-height);
    grid-auto-flow: row dense;
    justify-content: center;
    gap: var(--grid-gap);
    padding: var(--grid-gap);
  }

  :global(.__grid--masonry > *) {
    align-self: start;
  }

  @supports (grid-template-rows: masonry) {
    :global(.__grid--masonry) {
      grid-auto-rows: auto;
      grid-auto-flow: initial;
      grid-template-rows: masonry;
    }

    :global(.__grid--masonry > *) {
      grid-row-end: auto;
    }
  }

  :global(.__grid--masonry.__stretch-first > *:first-child) {
    grid-column: 1 / -1;
  }
</style>
