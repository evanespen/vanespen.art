<script>
    import {slide} from 'svelte/transition';
    import SideTitles from "$lib/SideTitles.svelte";
    import ReviewPicture from "$lib/ReviewPicture.svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    const review = data.review;
</script>

<main in:slide out:slide>

    <SideTitles/>

    <div id="review-header">
        <h1>Revue de la séance "<i>{data.review.name}</i>"</h1>

        <div id="review-pictures">
            {#each data.review.pictures as picture}
                <ReviewPicture {picture} {review}/>
            {/each}
        </div>
    </div>
</main>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  main {
    @include f-p-2;
    width: 80vw;
    position: fixed;
    top: 10vh;
    left: 10vw;

    #review-header {
      width: 100%;
      border-bottom: 1px solid $text;
      height: 3em;

      h1 {
        @include f-h-b;
      }
    }

    #review-pictures {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
  }
</style>