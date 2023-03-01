<script>
    import SideTitles from "$lib/SideTitles.svelte";
    import ReviewPicture from "$lib/ReviewPicture.svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    const review = data.review;

    function downloadAll() {
        const src = `/api/review-pictures/${review.name}/${review.name}.zip`;
        const a = document.createElement('a');
        a.href = src;
        a.download = src.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
</script>

<main>

    <SideTitles/>

    <div id="review-header">
        <h2>Revue de la séance "<i>{data.review.name}</i>"</h2>
        <h5>({data.review.pictures.length} photos)</h5>
    </div>

    <div id="download-button">
        <button on:click={downloadAll}>Tout télécharger</button>
    </div>

    <div id="review-pictures">
        {#each data.review.pictures as picture}
            <ReviewPicture {picture} {review}/>
        {/each}
    </div>

</main>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  main {
    @include f-p-2;
    width: 80vw;
    position: absolute;
    top: 10vh;
    left: 10vw;
    padding-bottom: 10vh !important;

    #review-header {
      width: 100%;
      border-bottom: 1px solid $text;
      height: 3em;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        @include f-h-b;
        font-size: 2em;
      }

      h5 {
        @include f-p-b;
        font-style: oblique;
        font-size: 1.5em;
        color: $subcolor;
      }
    }

    #download-button {
      margin-top: 2vh;

      button {
        @include f-p-2;
        width: 100%;
        font-size: 2em;
        outline: none !important;
        border: none !important;
        padding: 5px;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        background-color: $subcolor;
        color: white;

        &:hover {
          cursor: pointer;
        }
      }
    }

    #review-pictures {
      margin-top: 2vh;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      grid-row-gap: 5vh;
    }
  }
</style>