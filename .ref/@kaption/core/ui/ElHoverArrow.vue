<script lang="ts" setup>
defineProps({
  size: { type: String, default: '' },
  direction: { type: String, default: '' },
})
</script>

<template>
  <svg
    class="elem-hover-arrow relative mt-0.5 stroke-current stroke-2"
    viewBox="0 0 10 10"
    aria-hidden="true"
    :class="[
      direction === 'left' ? 'arrow-left mr-2' : 'ml-2',
      size === 'large' ? 'w-3 h-3' : 'w-2.5 h-2.5',
    ]"
  >
    <g fill-rule="evenodd">
      <path
        class="a transition-transform"
        d="M1 1l4 4-4 4"
        :class="[
          direction === 'left' ? 'origin-center transform rotate-180' : '',
        ]"
      />
      <path
        class="b opacity-0 transition-opacity"
        d="M0 5h7"
        :class="[direction === 'left' ? 'transform translate-x-1' : '']"
      />
    </g>
  </svg>
</template>

<style lang="less">
button,
a {
  .elem-hover-arrow {
    fill: none;
  }
  &:hover .elem-hover-arrow {
    .a {
      transform: translateX(3px);
    }
    .b {
      opacity: 1;
    }
    &.arrow-left {
      .a {
        transform-origin: center;
        transform: translateX(-0.25rem) rotate(-180deg);
      }
    }
  }
}
</style>
