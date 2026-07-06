<script lang="ts">
  interface Props {
    items: string[];
  }

  let { items = $bindable() }: Props = $props();

  let rotation = $state(0);
  let spinning = $state(false);
  let winner = $state('');
  let winnerVisible = $state(false);

  const COLORS = [
    '#e05c5c',
    '#d97f3a',
    '#c8a800',
    '#4c9a52',
    '#3a86c8',
    '#7b5ea7',
    '#c8547a',
    '#3aadad',
    '#8b7340',
    '#6a6a6a',
  ];

  const RADIUS = 180;
  const CX = 200;
  const CY = 200;
  const SPIN_DURATION_MS = 5200;

  const sliceAngle = $derived(360 / items.length);

  function polar(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function arcPath(start: number, end: number) {
    const p1 = polar(start, RADIUS);
    const p2 = polar(end, RADIUS);
    const large = end - start <= 180 ? 0 : 1;
    return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
  }

  function spin() {
    if (spinning || items.length < 2) return;

    spinning = true;
    winner = '';
    winnerVisible = false;

    const index = Math.floor(Math.random() * items.length);
    const target = 360 - (index * sliceAngle + sliceAngle / 2);
    const extraTurns = 5 + Math.floor(Math.random() * 3);

    rotation += extraTurns * 360 + target - (rotation % 360);

    setTimeout(() => {
      winner = items[index];
      winnerVisible = true;
      spinning = false;
      // Remove the winner immediately once the wheel stops
      items = items.filter((_, i) => i !== index);
    }, SPIN_DURATION_MS);
  }
</script>

<div class="spinner-root">
  <!-- Pointer -->
  <div class="pointer-wrap">
    <div class="pointer-arrow"></div>
  </div>

  <!-- Wheel -->
  <div class="wheel-wrap">
    {#if items.length === 0}
      <div class="empty-wheel">
        <p>Add items to spin</p>
      </div>
    {:else if items.length === 1}
      <svg
        viewBox="0 0 400 400"
        class="wheel"
        style={`transform: rotate(${rotation}deg);`}
      >
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill={COLORS[0]}
          stroke="white"
          stroke-width="2"
        />
        <text
          x={CX}
          y={CY}
          text-anchor="middle"
          dominant-baseline="middle"
          fill="white"
          font-size="18"
          font-weight="bold"
        >
          {items[0]}
        </text>
        <circle cx={CX} cy={CY} r="22" fill="#111" />
      </svg>
    {:else}
      <svg
        viewBox="0 0 400 400"
        class="wheel"
        style={`transform: rotate(${rotation}deg);`}
      >
        {#each items as item, i}
          {@const start = i * sliceAngle}
          {@const end = start + sliceAngle}
          {@const mid = start + sliceAngle / 2}
          {@const pos = polar(mid, RADIUS * 0.65)}

          <path
            d={arcPath(start, end)}
            fill={COLORS[i % COLORS.length]}
            stroke="white"
            stroke-width="2"
          />

          <text
            x={pos.x}
            y={pos.y}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="white"
            font-size={sliceAngle < 30 ? '10' : '14'}
            font-weight="bold"
            transform={`rotate(${mid} ${pos.x} ${pos.y})`}
          >
            {item.length > 10 ? item.slice(0, 9) + '…' : item}
          </text>
        {/each}

        <circle cx={CX} cy={CY} r="22" fill="#111" />
        <circle cx={CX} cy={CY} r="8" fill="rgba(255,255,255,0.5)" />
      </svg>
    {/if}
  </div>

  <!-- Spin button -->
  <button
    class="btn primary"
    onclick={spin}
    disabled={spinning || items.length < 2}
    aria-label="Spin the wheel"
  >
    {#if spinning}
      Spinning…
    {:else if items.length < 2}
      Add items to spin
    {:else}
      Spin
    {/if}
  </button>

  <!-- Winner banner -->
  {#if winnerVisible}
    <div class="winner-banner" aria-live="polite">
      <span class="winner-label">Winner:</span>
      <span class="winner-name">{winner}</span>
    </div>
  {/if}
</div>

<style>
  .spinner-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  /* ── Pointer ── */
  .pointer-wrap {
    position: relative;
    z-index: 10;
    margin-bottom: -12px;
  }

  .pointer-arrow {
    width: 0;
    height: 0;
    border-left: 14px solid transparent;
    border-right: 14px solid transparent;
    border-top: 28px solid #111;
  }

  /* ── Wheel ── */
  .wheel-wrap {
    position: relative;
    width: min(400px, 88vw);
    height: min(400px, 88vw);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wheel {
    width: 100%;
    height: 100%;
    transition: transform 5s cubic-bezier(0.17, 0.67, 0.12, 1);
  }

  /* ── Empty state ── */
  .empty-wheel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px dashed #ccc;
    background: #fafafa;
    color: #aaa;
    font-size: 0.9rem;
  }

  .empty-wheel p {
    margin: 0;
  }

  /* ── Winner banner ── */
  @keyframes pop-in {
    from {
      transform: scale(0.85);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .winner-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #d1d1d1;
    border-radius: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: #fff;
    animation: pop-in 0.25s ease both;
  }

  .winner-label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }

  .winner-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #111;
  }
</style>
