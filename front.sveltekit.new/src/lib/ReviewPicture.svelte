<script lang="ts">
    import ThumbsUp from '$lib/svgs/thumbs-up.svg?url';
    import ThumbsUpFilled from '$lib/svgs/thumbs-up--filled.svg?url';
    import ThumbsDown from '$lib/svgs/thumbs-down.svg?url';
    import ThumbsDownFilled from '$lib/svgs/thumbs-down--filled.svg?url'
    import Send from '$lib/svgs/send.svg?url';
    import Download from '$lib/svgs/download.svg?url';

    export let picture;
    export let review;

    const pictureFname = picture.path.split('/').at(-1);
    const src = `/api/review-pictures/${review.name}/${pictureFname}`;

    let comment = picture.comment;

    async function setStatus(status) {
        picture.status = status;
        console.log(picture.status);
        console.log(src)

        const response = await fetch(src, {
            method: 'PUT',
            body: JSON.stringify({
                action: 'setStatus',
                value: picture.status,
            })
        });
    }

    async function setComment() {
        picture.comment = comment;

        const response = await fetch(src, {
            method: 'PUT',
            body: JSON.stringify({
                action: 'setComment',
                value: picture.comment,
            })
        });
    }

    function download() {
        const a = document.createElement('a');
        a.href = src;
        a.download = src.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

</script>

<main>
    <img {src}>
    <div id="controls">
        <div id="buttons">

            {#if picture.status === -1}
                <button on:click={() => setStatus(1)}><img src={ThumbsUp} alt=""></button>
                <button on:click={() => setStatus(0)}><img src={ThumbsDownFilled} alt=""></button>
            {/if}
            {#if picture.status === 0}
                <button on:click={() => setStatus(1)}><img src={ThumbsUp} alt=""></button>
                <button on:click={() => setStatus(-1)}><img src={ThumbsDown} alt=""></button>
            {/if}
            {#if picture.status === 1}
                <button on:click={() => setStatus(0)}><img src={ThumbsUpFilled} alt=""></button>
                <button on:click={() => setStatus(-1)}><img src={ThumbsDown} alt=""></button>
            {/if}

            <button on:click={download}><img src={Download} alt=""></button>

        </div>
        <div id="comment">
            <textarea cols="50" rows="2" bind:value={comment} placeholder="Commentaire..."></textarea>
            <button on:click={() => setComment()}><img src={Send} alt=""></button>
        </div>
    </div>
</main>

<style lang="scss">
  @import "$src/color.scss";
  @import "$src/fonts.scss";

  main {
    z-index: 10000;
    border-radius: 0 0 10px 10px;
    background-color: white;
    box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
    width: 25vw;
    align-self: start;

    @media (max-width: 800px) {
      width: 100%;
    }


    img {
      width: 100%;
    }

    #controls {
      height: 100px;
      display: flex;
      justify-content: space-between;
      padding: 0px 10px;

      #buttons {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 20%;

        button {
          height: 32px;
          border: none;
          outline: none;
          background: none;

          &:hover {
            cursor: pointer;
          }

          img {
            width: 100%;
            height: 100%;
          }
        }
      }

      #comment {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 80%;

        button {
          width: 32px;
          border: none;
          outline: none;
          background: none;

          &:hover {
            cursor: pointer;
          }

          img {
            width: 100%;
            height: 100%;
          }
        }

        textarea {
          height: 80%;
          width: 80%;
          resize: none;
          font-family: sans-serif;
        }
      }
    }
  }
</style>