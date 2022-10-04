<script lang="ts">
    import {onMount} from "svelte";
    import {slide} from 'svelte/transition';
    import SideTitles from "$lib/SideTitles.svelte";
    import PicturesGallery from "$lib/PicturesGallery.svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    let picturesContainer;

    onMount(() => {
    })
</script>

<main in:slide out:slide>

    <SideTitles/>

    <div id="pictures" bind:this={picturesContainer}>
        <PicturesGallery pictures={data.pictures} mode="grouped"/>

        <!--{#each Object.keys(data.pictures) as month}-->
        <!--    <div class="month-header">-->
        <!--        <h2>{month}</h2>-->
        <!--        <h5>({data.pictures[month].length} photos)</h5>-->
        <!--    </div>-->
        <!--    <PicturesGallery pictures={data.pictures[month]} mode="mainGallery" on:openLightbox={openLightbox} />-->
        <!--{/each}-->
    </div>
</main>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  *, *:before, *:after {
    box-sizing: border-box !important;
  }

  #pictures {
    position: absolute;
    top: 7vh;
    left: 10vw;
    width: 80vw;
  }
</style>
