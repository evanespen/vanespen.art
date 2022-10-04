<script lang="ts">
    export let picture;

    import {createEventDispatcher, onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import {apiUrl} from '$lib/config.ts';

    const dispatch = createEventDispatcher();
    let imageElem;
    let src = '';
    let classes = 'image-element';

    function isInViewport() {
        let rect = imageElem.getBoundingClientRect();
        if (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.5 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) * 1.5
        ) {
            $: src = apiUrl + '/THUMBS/' + picture.path;
        }
    }


    function handleMouseMove(e) {
        imageElem.firstChild.style.transform = `scale(1.1) translateY(${e.clientY / 50 + 'px'}) translateX(${e.clientX / 50 + 'px'})`;
    }

    function handleMouseLeave(e) {
        imageElem.firstChild.style.transform = 'scale(1)';
    }

    function openLightbox() {
        dispatch('openLightbox', {picture});
    }

    onMount(() => {
        if (picture.landscape) classes = classes + ' orient-landscape';
        else if (!picture.landscape) classes = classes + ' orient-portrait';
        else console.log('NO ORIENT');
        if (picture.stared) classes = classes + ' stared';
        if (picture.blured) classes = classes + ' blured';
        window.setTimeout(isInViewport, 300);
    });
</script>

<svelte:window on:scroll={isInViewport}/>

<div class={classes} transition:scale
     bind:this={imageElem}
     on:click={openLightbox}>
    <img {src} on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}/>
</div>


<style lang="scss">
  .image-element {
    position: relative;
    overflow: hidden;
    display: flex;
    min-height: 400px;
    //align-items: center;
    //justify-content: center;
    filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, .3));

    &.orient-landscape {
      grid-column-end: span 2;
      grid-row-end: span 1;

      &.stared {
        grid-column-end: span 3;
        grid-row-end: span 2;
      }
    }

    &.orient-portrait {
      grid-column-end: span 1;
      grid-row-end: span 1;

      &.stared {
        grid-column-end: span 2;
        grid-row-end: span 2;
      }
    }

    img {
      //height: 100%;
      //min-height: 400px;
      width: 100%;
      transition: .25s;
    }
  }

  //.blured {
  //  img {
  //    filter: blur(10px);
  //  }
  //}
</style>
